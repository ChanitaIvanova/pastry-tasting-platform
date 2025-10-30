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
  },
  type: {
    type: String,
    enum: ['rating', 'single-select', 'text'],
    default: 'rating'
  },
  options: {
    type: [String],
    default: void 0,
    set: function(options) {
      if (!options) return undefined;
      return options.map(option => option.trim());
    }
  },
  maxLength: {
    type: Number,
    default: function() {
      return this.type === 'text' ? 500 : undefined;
    }
  }
});

questionSchema.pre('validate', function(next) {
  if (this.type === 'single-select') {
    if (!this.options || this.options.length === 0) {
      this.invalidate('options', 'Single select questions must include answer options');
    }
  } else if (this.options && this.options.length) {
    this.options = undefined;
  }

  if (this.type === 'text') {
    this.maxLength = 500;
  } else if (this.maxLength) {
    this.maxLength = undefined;
  }

  next();
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