// models/Mood.js
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    mood: { type: Number, required: true }, // 1-5 arasında ruh hali
    physicalCondition: { type: String, required: true },
    stressLevel: { type: String, required: true },
    socialInteraction: { type: String, required: true },
    productivity: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Mood = mongoose.model('Mood', moodSchema);

module.exports = Mood;
