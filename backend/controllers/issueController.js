const { GoogleGenAI } = require('@google/genai');
const Issue = require('../models/Issue');

const VALID_CATEGORIES = [
  'Pot-hole',
  'Waste Management',
  'Streetlight',
  'Stray Animals',
  'Public Infrastructure',
];

const VALID_STATUSES = ['Pending', 'Verified', 'In Progress', 'Resolved'];

const SYSTEM_INSTRUCTION = `You are a civic issue classification assistant for Smartnagar, India.
Analyze the provided image and user description of a reported civic issue.

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.

The JSON object must contain exactly these fields:
- "category": string — best match from: "Pot-hole", "Waste Management", "Streetlight", "Stray Animals", "Public Infrastructure"
- "severityScore": integer from 1 to 10 (1 = minor nuisance, 10 = critical public safety hazard)
- "aiSummary": string — one concise sentence summarizing the issue`;

const parseAiJson = (text) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonStr);
};

const analyzeIssueWithGemini = async (description, file) => {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: `User description: ${description}` },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: file.buffer.toString('base64'),
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
    },
  });

  return parseAiJson(response.text);
};

const reportIssue = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }

    if (!req.imageUrl) {
      return res.status(400).json({ message: 'Image upload is required' });
    }

    const aiResult = await analyzeIssueWithGemini(description.trim(), req.file);

    if (!aiResult.category || !VALID_CATEGORIES.includes(aiResult.category)) {
      return res.status(422).json({ message: 'AI returned an invalid category' });
    }

    const severityScore = Number(aiResult.severityScore);
    if (!Number.isInteger(severityScore) || severityScore < 1 || severityScore > 10) {
      return res.status(422).json({ message: 'AI returned an invalid severity score' });
    }

    if (!aiResult.aiSummary || typeof aiResult.aiSummary !== 'string') {
      return res.status(422).json({ message: 'AI returned an invalid summary' });
    }

    const issue = await Issue.create({
      title: aiResult.aiSummary.trim(),
      description: description.trim(),
      imageUrl: req.imageUrl,
      category: aiResult.category,
      severityScore,
      aiSummary: aiResult.aiSummary.trim(),
      reportedBy: req.user._id,
    });

    const populatedIssue = await Issue.findById(issue._id).populate('reportedBy', 'name email role');

    res.status(201).json(populatedIssue);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return res.status(422).json({ message: 'Failed to parse AI response' });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    console.error('Report issue error:', error.message);
    res.status(500).json({ message: 'Server error while reporting issue' });
  }
};

const verifyIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const userId = req.user._id.toString();

    if (issue.reportedBy.toString() === userId) {
      return res.status(400).json({ message: 'You cannot upvote your own issue' });
    }

    const alreadyUpvoted = issue.upvotes.some((id) => id.toString() === userId);
    if (alreadyUpvoted) {
      return res.status(400).json({ message: 'You have already upvoted this issue' });
    }

    issue.upvotes.push(req.user._id);
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role civicPoints')
      .populate('upvotes', 'name email');

    res.status(200).json(populatedIssue);
  } catch (error) {
    console.error('Verify issue error:', error.message);
    res.status(500).json({ message: 'Server error while upvoting issue' });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('reportedBy', 'name email role civicPoints')
      .populate('upvotes', 'name email');

    res.status(200).json(populatedIssue);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    console.error('Update issue status error:', error.message);
    res.status(500).json({ message: 'Server error while updating issue status' });
  }
};

const getIssues = async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 })
      .populate('reportedBy', 'name email role civicPoints')
      .populate('upvotes', 'name email');

    res.status(200).json(issues);
  } catch (error) {
    console.error('Get issues error:', error.message);
    res.status(500).json({ message: 'Server error while fetching issues' });
  }
};

module.exports = { reportIssue, getIssues, verifyIssue, updateIssueStatus };
