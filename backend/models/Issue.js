const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    severityScore: {
      type: Number,
      min: 1,
      max: 10,
      default: 1,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

issueSchema.pre('save', async function (next) {
  if (!this.isModified('status') || this.status !== 'Resolved' || this.isNew) {
    return next();
  }

  try {
    const previous = await this.constructor.findById(this._id).select('status').lean();

    if (!previous || previous.status === 'Resolved') {
      return next();
    }

    await mongoose.model('User').findByIdAndUpdate(this.reportedBy, {
      $inc: { civicPoints: 50 },
    });

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Issue', issueSchema);
