// routes/moodRoutes.js
const express = require('express');
const router = express.Router();
const { generateSuggestions, generateExerciseSuggestions, generateDevelopmentTips, generateSocialSuggestions } = require('../controllers/moodController');
const photoController = require('../controllers/photoController');


// Anasayfa route'u
router.get('/', photoController.showUploadForm);
router.post('/upload', photoController.uploadPhoto);  // Fotoğrafı yükle
router.post('/analyze', photoController.analyzePhoto);  // Yüklenen fotoğrafı analiz et

// Ruh hali gönderme (POST) route'u
router.post('/submitMood', generateSuggestions);
router.post('/submitForExercise', generateExerciseSuggestions);
router.post('/submitForPDT', generateDevelopmentTips);
router.post('/submitForSocial', generateSocialSuggestions);




module.exports = router;
