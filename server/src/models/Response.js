const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  criterion: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: String,
});

const responseSchema = new mongoose.Schema({
  questionnaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Questionnaire',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [answerSchema],
  comparativeEvaluation: {
    preferredBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    comments: String,
  },
  isSubmitted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Response', responseSchema); 