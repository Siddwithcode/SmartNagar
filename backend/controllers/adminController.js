const Issue = require('../models/Issue');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalIssues,
      pendingIssues,
      verifiedIssues,
      inProgressIssues,
      resolvedIssues,
      avgSeverityResult,
      totalCitizens,
      aiReportsProcessed,
      civicPointsResult,
      categoryAgg,
      activeCitizenIds,
    ] = await Promise.all([
      Issue.countDocuments(),
      Issue.countDocuments({ status: 'Pending' }),
      Issue.countDocuments({ status: 'Verified' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' }),
      Issue.aggregate([{ $group: { _id: null, avg: { $avg: '$severityScore' } } }]),
      User.countDocuments({ role: 'Citizen' }),
      Issue.countDocuments({ aiSummary: { $exists: true, $ne: '' } }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$civicPoints' } } }]),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      Issue.distinct('reportedBy'),
    ]);

    const avgSeverity = avgSeverityResult[0]?.avg
      ? Number(avgSeverityResult[0].avg.toFixed(1))
      : 0;
    const totalCivicPoints = civicPointsResult[0]?.total ?? 0;
    const mostCommonCategory = categoryAgg[0]?._id ?? 'N/A';
    const resolutionRate =
      totalIssues > 0 ? Number(((resolvedIssues / totalIssues) * 100).toFixed(1)) : 0;

    res.status(200).json({
      totalIssues,
      pendingIssues,
      verifiedIssues,
      inProgressIssues,
      resolvedIssues,
      avgSeverity,
      mostCommonCategory,
      totalCitizens,
      activeCitizens: activeCitizenIds.length,
      aiReportsProcessed,
      totalCivicPoints,
      resolutionRate,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [
      monthlyReports,
      categoryDistribution,
      statusDistribution,
      severityDistribution,
      weeklyTrends,
      topCategories,
      resolvedIssues,
      highestSeverity,
      mostActiveCitizen,
      totalClassified,
      totalIssues,
    ] = await Promise.all([
      Issue.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 12 },
      ]),
      Issue.aggregate([
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $sort: { value: -1 } },
      ]),
      Issue.aggregate([{ $group: { _id: '$status', value: { $sum: 1 } } }]),
      Issue.aggregate([
        { $group: { _id: '$severityScore', value: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Issue.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%W', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 8 },
      ]),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Issue.find({ status: 'Resolved' }).select('createdAt updatedAt'),
      Issue.findOne().sort({ severityScore: -1 }).populate('reportedBy', 'name'),
      Issue.aggregate([
        { $group: { _id: '$reportedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'citizen',
          },
        },
        { $unwind: '$citizen' },
      ]),
      Issue.countDocuments({ aiSummary: { $exists: true, $ne: '' } }),
      Issue.countDocuments(),
    ]);

    let avgResolutionTimeHours = 0;
    if (resolvedIssues.length > 0) {
      const totalHours = resolvedIssues.reduce((sum, issue) => {
        const diff = new Date(issue.updatedAt) - new Date(issue.createdAt);
        return sum + diff / (1000 * 60 * 60);
      }, 0);
      avgResolutionTimeHours = Number((totalHours / resolvedIssues.length).toFixed(1));
    }

    const aiAccuracy = totalIssues > 0
      ? Number(((totalClassified / totalIssues) * 100).toFixed(1))
      : 0;

    res.status(200).json({
      monthlyReports: monthlyReports.map((item) => ({
        month: item._id,
        reports: item.count,
      })),
      categoryDistribution: categoryDistribution.map((item) => ({
        name: item._id,
        value: item.value,
      })),
      statusDistribution: statusDistribution.map((item) => ({
        name: item._id,
        value: item.value,
      })),
      severityDistribution: severityDistribution.map((item) => ({
        severity: item._id,
        count: item.value,
      })),
      weeklyTrends: weeklyTrends.map((item) => ({
        week: item._id,
        reports: item.count,
      })),
      topCategories: topCategories.map((item) => ({
        category: item._id,
        count: item.count,
      })),
      avgResolutionTimeHours,
      mostReportedArea: topCategories[0]?.category ?? 'N/A',
      highestSeverityIssue: highestSeverity
        ? {
            title: highestSeverity.title,
            severity: highestSeverity.severityScore,
            reporter: highestSeverity.reportedBy?.name,
          }
        : null,
      mostActiveCitizen: mostActiveCitizen[0]
        ? {
            name: mostActiveCitizen[0].citizen.name,
            reports: mostActiveCitizen[0].count,
          }
        : null,
      aiAccuracy,
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};

const getTopCitizens = async (req, res) => {
  try {
    const citizens = await Issue.aggregate([
      {
        $group: {
          _id: '$reportedBy',
          reportsSubmitted: { $sum: 1 },
          resolvedReports: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { reportsSubmitted: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'citizen',
        },
      },
      { $unwind: '$citizen' },
      {
        $project: {
          _id: '$citizen._id',
          name: '$citizen.name',
          email: '$citizen.email',
          civicPoints: '$citizen.civicPoints',
          reportsSubmitted: 1,
          resolvedReports: 1,
        },
      },
    ]);

    res.status(200).json(
      citizens.map((citizen, index) => ({
        rank: index + 1,
        ...citizen,
      }))
    );
  } catch (error) {
    console.error('Top citizens error:', error.message);
    res.status(500).json({ message: 'Failed to fetch top citizens' });
  }
};

const getAdminIssues = async (req, res) => {
  try {
    const { search, status, category, severity, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severityScore = Number(severity);
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const issues = await Issue.find(filter)
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email role civicPoints')
      .populate('upvotes', 'name email');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Admin issues error:', error.message);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
};

const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(200).json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete issue' });
  }
};

const bulkAction = async (req, res) => {
  try {
    const { issueIds, action, status } = req.body;

    if (!Array.isArray(issueIds) || issueIds.length === 0) {
      return res.status(400).json({ message: 'issueIds array is required' });
    }

    if (action === 'delete') {
      await Issue.deleteMany({ _id: { $in: issueIds } });
      return res.status(200).json({ message: `${issueIds.length} issues deleted` });
    }

    if (action === 'verify') {
      await Issue.updateMany({ _id: { $in: issueIds } }, { status: 'Verified' });
      return res.status(200).json({ message: `${issueIds.length} issues verified` });
    }

    if (action === 'changeStatus' && status) {
      await Issue.updateMany({ _id: { $in: issueIds } }, { status });
      return res.status(200).json({ message: `Status updated for ${issueIds.length} issues` });
    }

    res.status(400).json({ message: 'Invalid bulk action' });
  } catch (error) {
    res.status(500).json({ message: 'Bulk action failed' });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getTopCitizens,
  getAdminIssues,
  deleteIssue,
  bulkAction,
};
