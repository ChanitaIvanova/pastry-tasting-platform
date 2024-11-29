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
    required: function() {
      return this.parent().parent().status === 'submitted';
    },
    min: 0,
    max: 5,
  }
});

const brandEvaluationSchema = new mongoose.Schema({
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  comment: String
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
  brandComments: [brandEvaluationSchema],
  comparativeEvaluation: {
    preferredBrand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: function() {
        return this.parent().parent().status === 'submitted';
      }
    },
    comments: String,
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Response', responseSchema); 