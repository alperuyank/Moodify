require("dotenv").config();
const fs = require("fs");
const path = require("path");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const {
  TextAnalyticsClient,
  AzureKeyCredential,
} = require("@azure/ai-text-analytics");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// API Anahtarları
const SPEECH_KEY = process.env.SPEECH_KEY;
const SPEECH_REGION = process.env.SPEECH_REGION;
const TEXT_ANALYTICS_KEY = process.env.TEXT_ANALYTICS_KEY;
const TEXT_ANALYTICS_ENDPOINT = process.env.TEXT_ANALYTICS_ENDPOINT;
const GEMINI_API_KEY = process.env.API_KEY;

// Google Gemini AI yapılandırması
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Azure Speech-to-Text İşlevi
const speechToText = (audioFilePath) => {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      SPEECH_KEY,
      SPEECH_REGION
    );
    const audioConfig = sdk.AudioConfig.fromWavFileInput(
      fs.readFileSync(audioFilePath)
    );
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    console.log("Ses dosyası işleniyor...");
    recognizer.recognizeOnceAsync((result) => {
      if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        console.log("Tanımlanan Metin:", result.text);
        resolve(result.text);
      } else {
        reject("Azure Speech-to-Text başarısız oldu.");
      }
    });
  });
};

// Azure Text Analytics - Duygu Analizi
const analyzeSentiment = async (text) => {
  const client = new TextAnalyticsClient(
    TEXT_ANALYTICS_ENDPOINT,
    new AzureKeyCredential(TEXT_ANALYTICS_KEY)
  );
  const documents = [text];

  const results = await client.analyzeSentiment(documents);
  const sentiment = results[0];
  return {
    text: text,
    sentiment: sentiment.sentiment,
    confidence_scores: sentiment.confidenceScores,
  };
};

// Gemini AI'den Mood Tavsiyesi Al
const getMoodAdvice = async (sentimentResult) => {
  const prompt = `
  Kullanıcının metin duygu analizi sonuçları:
  - Metin: ${sentimentResult.text}
  - Duygu: ${sentimentResult.sentiment}
  - Güven Skorları: 
    - Pozitif: ${sentimentResult.confidence_scores.positive}
    - Nötr: ${sentimentResult.confidence_scores.neutral}
    - Negatif: ${sentimentResult.confidence_scores.negative}

  Kullanıcının duygu durumuna uygun bir ruh hali tavsiyesi ver.
  Eğer duygu negatifse (üzüntü, öfke vb.) kullanıcının moralini yükseltecek önerilerde bulun.
  Tavsiyeyi pozitif bir tonla kısa ve net şekilde yaz.
  `;

  const result = await model.generateContent(prompt);
  return result.response.candidates[0].content.parts[0].text.trim();
};

// Ses Analiz Fonksiyonu
const analyzeAudioFile = async (req, res) => {
  if (!req.file)
    return res.status(400).send("Lütfen bir ses dosyası yükleyin!");

  const audioFilePath = path.resolve(
    __dirname,
    "../uploads",
    req.file.filename
  );

  try {
    // 1. Azure ile Speech-to-Text
    const recognizedText = await speechToText(audioFilePath);

    // 2. Azure ile Duygu Analizi
    const sentimentResult = await analyzeSentiment(recognizedText);

    // 3. Gemini AI ile Mood Tavsiyesi
    const moodAdvice = await getMoodAdvice(sentimentResult);

    // 4. Sonuçları JSON dosyasına kaydet
    const resultFilePath = path.resolve(
      __dirname,
      "../uploads/audio_analysis_results.json"
    );
    const result = {
      sentiment_analysis: sentimentResult,
      mood_advice: moodAdvice,
    };
    fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 4), "utf8");
    res.render("audio", {
      message: "Audio file analysis is complated.",
      recognized_text: recognizedText,
      sentiment_analysis: sentimentResult,
      mood_advice: moodAdvice,
      result_file: resultFilePath,
    });

    // 5. Kullanıcıya Yanıt Döndür
    // res.json({
    //   message: "Ses dosyası analizi başarıyla tamamlandı.",
    //   recognized_text: recognizedText,
    //   sentiment_analysis: sentimentResult,
    //   mood_advice: moodAdvice,
    //   result_file: resultFilePath,
    // });
  } catch (error) {
    console.error("Ses Analizi Hatası:", error);
    res
      .status(500)
      .json({
        error: "Ses analizi sırasında hata oluştu.",
        details: error,
      });
  }
};

module.exports = { analyzeAudioFile };
