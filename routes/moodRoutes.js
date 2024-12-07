// routes/moodRoutes.js
const express = require('express');
const router = express.Router();
const { generateSuggestions, generateExerciseSuggestions, generateDevelopmentTips } = require('../controllers/moodController');

// Anasayfa route'u
router.get('/', (req, res) => {
    res.send('Ruh Hali Uygulaması API\'sine hoş geldiniz!');
});

// Ruh hali gönderme (POST) route'u
router.post('/submitMood', generateSuggestions);
router.post('/submitForExercise', generateExerciseSuggestions);
router.post('/submitForPDT', generateDevelopmentTips);

module.exports = router;
