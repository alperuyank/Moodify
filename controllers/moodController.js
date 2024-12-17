require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSuggestions = async (req, res) => {
  const { mood, physicalCondition, stressLevel, socialInteraction, productivity } = req.body;

  if (!mood) {
    return res.status(400).json({ error: "Ruh hali gerekli!" });
  }

  const prompt = `
    Kullanıcının ruh hali ve durumu:
    - Ruh Hali(1-5): ${mood}
    - Fiziksel Durum: ${physicalCondition}
    - Stres Seviyesi: ${stressLevel}
    - Sosyal Etkileşim: ${socialInteraction}
    - Üretkenlik: ${productivity}

    Görev:
    1. Ruh haline uygun 3 müzik önerisi (şarkı adı ve sanatçı adı dahil).
    2. Ruh haline uygun 3 kitap önerisi (kitap adı ve yazarı dahil).
    3. Ruh haline uygun 3 film önerisi (film adı ve kısa açıklama dahil).
    4. Eğer stres seviyesi yüksekse, rahatlama teknikleri öner.

    Yanıtınızı JSON formatında döndür:
    {
        "music": [...],
        "books": [...],
        "movies": [...],
        "relaxationTechniques": [...]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const cleanedResponse = result.response.candidates[0].content.parts[0].text.trim().replace(/```json|```/g, "");
    const jsonResponse = JSON.parse(cleanedResponse);
    return res.render("suggestion", { recommendations: jsonResponse });
  } catch (error) {
    console.error("Gemini API hatası:", error);
    return res.status(500).json({ error: "Gemini API ile iletişimde hata oluştu." });
  }
};

module.exports = {
  generateSuggestions,
};
