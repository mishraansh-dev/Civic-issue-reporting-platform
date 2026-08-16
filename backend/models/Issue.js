const mongoose = require('mongoose')

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Road', 'Water', 'Electricity', 'Garbage', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    imageUrl: {
      type: String,
      default: null,
    },
    locationText: {
      type: String,
      required: [true, 'Location description is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// Compound indexes for faster queries
issueSchema.index({ status: 1, category: 1 })
issueSchema.index({ userId: 1, createdAt: -1 })
issueSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Issue', issueSchema)
