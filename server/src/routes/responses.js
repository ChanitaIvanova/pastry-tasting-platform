const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, isAdmin } = require('../middleware/auth');
const Response = require('../models/Response');
const Questionnaire = require('../models/Questionnaire');
const router = express.Router();

// Validation middleware
const validateResponse = [
  body('answers').isArray().notEmpty(),
  body('answers.*.brand').isMongoId(),
  body('answers.*.criterion').isString().trim().notEmpty(),
  body('answers.*.rating').isInt({ min: 1, max: 5 }),
  body('comparativeEvaluation.preferredBrand').optional().isMongoId(),
  body('comparativeEvaluation.comments').optional().trim()
];

// Submit a response
router.post('/:questionnaireId', [auth, validateResponse], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const questionnaire = await Questionnaire.findById(req.params.questionnaireId);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    if (questionnaire.status === 'closed') {
      return res.status(400).json({ message: 'Questionnaire is closed' });
    }

    // Validate that all criteria exist in the questionnaire
    const validCriteria = questionnaire.questions.map(q => q.criterion);
    const invalidCriteria = req.body.answers.filter(
      answer => !validCriteria.includes(answer.criterion)
    );

    if (invalidCriteria.length > 0) {
      return res.status(400).json({
        message: 'Invalid criteria found',
        invalidCriteria: invalidCriteria.map(a => a.criterion)
      });
    }

    // Check if user has already submitted a response
    const existingResponse = await Response.findOne({
      questionnaire: questionnaire._id,
      user: req.user._id
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted a response' });
    }

    const response = new Response({
      questionnaire: questionnaire._id,
      user: req.user._id,
      answers: req.body.answers,
      comparativeEvaluation: req.body.comparativeEvaluation,
      isSubmitted: true
    });

    await response.save();
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response', error: error.message });
  }
});

// Get user's responses
router.get('/my-responses', auth, async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user._id })
      .populate('questionnaire', 'title status')
      .sort('-createdAt');
    
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching responses', error: error.message });
  }
});

// Get all responses for a questionnaire (Admin only)
router.get('/questionnaire/:questionnaireId', [auth, isAdmin], async (req, res) => {
  try {
    const responses = await Response.find({ 
      questionnaire: req.params.questionnaireId,
      status: 'submitted'
    })
      .populate('user', 'username email')
      .populate('questionnaire', 'title status');
    
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching responses', error: error.message });
  }
});

// Get statistics for a questionnaire (Admin only)
router.get('/statistics/:questionnaireId', [auth, isAdmin], async (req, res) => {
  try {
    const responses = await Response.find({
      questionnaire: req.params.questionnaireId,
      status: 'submitted'
    });

    const statistics = {
      totalResponses: responses.length,
      criteriaAverages: {},
      brandRatings: {},
      brandPreferences: {}
    };

    // Calculate statistics for each brand
    responses.forEach(response => {
      // Group answers by brand
      response.answers.forEach(answer => {
        const brandId = answer.brand.toString();
        
        // Initialize brand ratings if not exists
        if (!statistics.brandRatings[brandId]) {
          statistics.brandRatings[brandId] = {
            totalScore: 0,
            count: 0,
            averageScore: 0,
            criteriaScores: {}
          };
        }

        // Initialize criterion if not exists
        if (!statistics.brandRatings[brandId].criteriaScores[answer.criterion]) {
          statistics.brandRatings[brandId].criteriaScores[answer.criterion] = 0;
        }

        // Update scores
        statistics.brandRatings[brandId].totalScore += answer.rating;
        statistics.brandRatings[brandId].count++;
        statistics.brandRatings[brandId].criteriaScores[answer.criterion] += answer.rating;

        // Update global criteria averages
        if (!statistics.criteriaAverages[answer.criterion]) {
          statistics.criteriaAverages[answer.criterion] = {
            sum: 0,
            count: 0
          };
        }
        statistics.criteriaAverages[answer.criterion].sum += answer.rating;
        statistics.criteriaAverages[answer.criterion].count++;
      });

      // Count brand preferences
      const preferredBrand = response.comparativeEvaluation.preferredBrand.toString();
      statistics.brandPreferences[preferredBrand] = 
        (statistics.brandPreferences[preferredBrand] || 0) + 1;
    });

    // Calculate final averages
    Object.keys(statistics.brandRatings).forEach(brandId => {
      const brand = statistics.brandRatings[brandId];
      brand.averageScore = Number((brand.totalScore / brand.count).toFixed(2));

      // Calculate average for each criterion
      Object.keys(brand.criteriaScores).forEach(criterion => {
        const totalResponses = responses.length;
        brand.criteriaScores[criterion] = Number(
          (brand.criteriaScores[criterion] / totalResponses).toFixed(2)
        );
      });
    });

    // Calculate final criteria averages
    Object.keys(statistics.criteriaAverages).forEach(criterion => {
      const { sum, count } = statistics.criteriaAverages[criterion];
      statistics.criteriaAverages[criterion] = Number((sum / count).toFixed(2));
    });

    res.json(statistics);
  } catch (error) {
    res.status(500).json({ message: 'Error generating statistics', error: error.message });
  }
});

// Update a response
router.put('/:responseId', [auth, validateResponse], async (req, res) => {
  try {
    const response = await Response.findOne({
      _id: req.params.responseId,
      user: req.user._id
    });

    if (!response) {
      return res.status(404).json({ message: 'Response not found' });
    }

    const questionnaire = await Questionnaire.findById(response.questionnaire);
    if (questionnaire.status === 'closed') {
      return res.status(400).json({ message: 'Cannot edit response for closed questionnaire' });
    }

    Object.assign(response, req.body);
    await response.save();
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Error updating response', error: error.message });
  }
});

module.exports = router; 