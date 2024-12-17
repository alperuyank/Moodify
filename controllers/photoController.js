const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Google Gemini API Yapılandırması
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fotoğraf yükleme klasörünü oluştur
const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage: storage }).single("photo");

// Gemini AI'ye Tavsiye Gönderen Fonksiyon
const getMoodAdvice = async (emotionResult) => {
  const prompt = `
  Aşağıdaki duygu analizi verilerine dayanarak kullanıcıya uygun bir mood tavsiyesi sun:

  Duygu Analizi Sonuçları:
  Dominant Duygu: ${emotionResult.dominant_emotion}
  Detaylı Duygular:
  ${Object.entries(emotionResult.emotion)
    .map(([key, value]) => `- ${key}: ${value.toFixed(2)}%`)
    .join("\n")}

  Görev:
  1. Kullanıcının dominant duygu durumuna uygun bir kısa ruh hali tavsiyesi yaz.
  2. Eğer duygu negatifse (örneğin üzüntü, öfke), kullanıcının moralini yükseltecek önerilerde bulun.
  Tavsiyeyi dostça ve pozitif bir tonla yaz.
  `;

  try {
    const result = await model.generateContent(prompt);
    const advice = result.response.candidates[0].content.parts[0].text.trim();
    return advice;
  } catch (error) {
    console.error("Gemini AI Hatası:", error);
    return "Gemini AI'den tavsiye alınırken bir hata oluştu.";
  }
};

const uploadPhoto = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(500).send(`Fotoğraf yüklenirken hata oluştu: ${err.message}`);
    }

    if (!req.file) return res.status(400).send("Lütfen bir fotoğraf seçin!");

    const imagePath = path.resolve(__dirname, "../uploads", req.file.filename);
    const pythonScriptPath = path.resolve(__dirname, "../scripts/face-expression.py");

    exec(`python "${pythonScriptPath}" "${imagePath}"`, async (error, stdout, stderr) => {
        if (error) {
          console.error("Python script hatası:", stderr);
          return res.status(500).json({ error: "Python script hatası", details: stderr });
        }
      
        try {
          // Python çıktısını JSON olarak parse et
          const resultArray = JSON.parse(stdout);
      
          // JSON bir dizi döndüğü için ilk elemanı alıyoruz
          const result = resultArray[0];
      
          // Analiz sonuçlarını bir dosyaya kaydet
          const resultFilePath = path.resolve(__dirname, "../uploads/analysis_results.json");
          fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 4), "utf8");
      
          // Gemini AI'den mood tavsiyesi al
          const moodAdvice = await getMoodAdvice(result);
      
          // Kullanıcıya sonuçları döndür
          res.json({
            message: "Analiz başarıyla tamamlandı ve mood tavsiyesi alındı.",
            analysis_results: result,
            mood_advice: moodAdvice,
            result_file: resultFilePath,
          });
        } catch (e) {
          console.error("JSON Parse Hatası:", e.message);
          res.status(500).json({ error: "JSON parse hatası", details: stdout });
        }
      });
  });
};

module.exports = { uploadPhoto };
