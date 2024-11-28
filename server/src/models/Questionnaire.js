const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const questionSchema = new mongoose.Schema({
  criterion: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  }
});

const questionnaireSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  brands: [brandSchema],
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Questionnaire', questionnaireSchema); 