const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, isAdmin } = require('../middleware/auth');
const Questionnaire = require('../models/Questionnaire');
const Response = require('../models/Response');
const router = express.Router();

// Validation middleware
const validateQuestionnaire = [
  body('title').trim().notEmpty(),
  body('brands').isArray().notEmpty(),
  body('brands.*.name').trim().notEmpty(),
  body('questions').isArray().notEmpty()
];

// Create questionnaire (Admin only)
router.post('/', [auth, isAdmin, validateQuestionnaire], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const questionnaire = new Questionnaire({
      ...req.body,
      createdBy: req.user._id
    });

    await questionnaire.save();
    res.status(201).json(questionnaire);
  } catch (error) {
    res.status(500).json({ message: 'Error creating questionnaire', error: error.message });
  }
});

// Get all questionnaires
router.get('/', auth, async (req, res) => {
  try {
    const questionnaires = req.user.role === 'admin'
      ? await Questionnaire.find()
      : await Questionnaire.find({ status: 'open' });
    
    res.json(questionnaires);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questionnaires', error: error.message });
  }
});

// Get single questionnaire
router.get('/:id', auth, async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }
    
    if (req.user.role !== 'admin' && questionnaire.status !== 'open') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(questionnaire);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questionnaire', error: error.message });
  }
});

// Update questionnaire (Admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    if (questionnaire.status === 'closed') {
      return res.status(400).json({ message: 'Cannot edit closed questionnaire' });
    }

    Object.assign(questionnaire, req.body);
    await questionnaire.save();
    res.json(questionnaire);
  } catch (error) {
    res.status(500).json({ message: 'Error updating questionnaire', error: error.message });
  }
});

// Close questionnaire (Admin only)
router.patch('/:id/close', [auth, isAdmin], async (req, res) => {
  try {
    const questionnaire = await Questionnaire.findById(req.params.id);
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found' });
    }

    questionnaire.status = 'closed';
    await questionnaire.save();
    res.json(questionnaire);
  } catch (error) {
    res.status(500).json({ message: 'Error closing questionnaire', error: error.message });
  }
});

module.exports = router; 