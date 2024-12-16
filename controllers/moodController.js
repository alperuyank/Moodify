// controllers/moodController.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.API_KEY;

// Google Generative AI'yi başlatıyoruz
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generateSuggestions = async (req, res) => {
  const {
    mood,
    physicalCondition,
    stressLevel,
    socialInteraction,
    productivity,
  } = req.body;

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
    4. Eğer stres seviyesi yüksekse, rahatlama teknikleri öner. (Nefes egzersizleri, meditasyon yöntemleri gibi.)

    Lütfen yanıtını aşağıdaki JSON formatında döndür:
    {
        "intro": "Kullanıcının ruh hali hakkında bir açıklama.",
        "music": [
            { "song": "Song Name", "artist": "Artist Name" },
            { "song": "Song Name", "artist": "Artist Name" },
            { "song": "Song Name", "artist": "Artist Name" }
        ],
        "books": [
            { "title": "Book Title", "author": "Author Name" },
            { "title": "Book Title", "author": "Author Name" },
            { "title": "Book Title", "author": "Author Name" }
        ],
        "movies": [
            { "title": "Movie Title", "description": "Short description of the movie." },
            { "title": "Movie Title", "description": "Short description of the movie." },
            { "title": "Movie Title", "description": "Short description of the movie." }
        ],
        "relaxationTechniques": [
            "Relaxation technique 1",
            "Relaxation technique 2",
            "Relaxation technique 3"
        ]
    }

    Yanıtınız sadece bu yapıyı takip etsin ve bu format dışında herhangi bir içerik döndürmesin.
    `;

  try {
    const result = await model.generateContent(prompt);

    // Gemini yanıtını log'la, tam y  apıyı görmek için
    console.log(
      "Gemini API Response:",
      JSON.stringify(result.response, null, 2)
    );

    // Yanıttan JSON kod bloğunu çıkarmak için temizleme işlemi yap
    const responseText =
      result.response.candidates[0].content.parts[0].text.trim();

    // ```json ve ``` işaretlerini temizle
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();

    // JSON verisini parse et
    const jsonResponse = JSON.parse(cleanedResponse);

    // Eğer JSON verisi doğru şekilde döndüyse, render et
    return res.render("suggestion", { recommendations: jsonResponse });
  } catch (error) {
    console.error("Gemini API hatası:", error);
    return res
      .status(500)
      .json({ error: "Gemini API ile iletişimde hata oluştu." });
  }
};

const generateExerciseSuggestions = async (req, res) => {
  const { mood, physicalCondition, stressLevel } = req.body;

  if (!mood || !physicalCondition) {
    return res
      .status(400)
      .json({ error: "Ruh hali ve fiziksel durum gerekli!" });
  }

  const prompt = `
    Kullanıcının ruh hali ve durumu:
    - Ruh Hali(1-5): ${mood}
    - Fiziksel Durum: ${physicalCondition}
    - Stres Seviyesi: ${stressLevel}

    Görev:
    1. Ruh haline ve fiziksel duruma uygun 3 egzersiz önerisi. 
    2. Eğer stres seviyesi yüksekse, rahatlama egzersizleri öner.

    Lütfen yanıtını aşağıdaki JSON formatında döndür:
    {
        "exercises": [
            { "exercise": "Egzersiz Adı", "duration": "Egzersiz Süresi", "intensity": "Düşük / Orta / Yüksek" },
            { "exercise": "Egzersiz Adı", "duration": "Egzersiz Süresi", "intensity": "Düşük / Orta / Yüksek" },
            { "exercise": "Egzersiz Adı", "duration": "Egzersiz Süresi", "intensity": "Düşük / Orta / Yüksek" }
        ]
    }

    Yanıtınız sadece bu yapıyı takip etsin ve bu format dışında herhangi bir içerik döndürmesin.
    `;

  try {
    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates[0].content.parts[0].text.trim();
    const cleanedResponse = responseText.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(cleanedResponse);
    return res.render("exercise", { exercises: jsonResponse });

  } catch (error) {
    console.error("Gemini API hatası:", error);
    return res.status(500).json({
      error: "Gemini API ile iletişimde hata oluştu.",
    });
  }
};

const generateDevelopmentTips = async (req, res) => {
    const { mood, productivity } = req.body;

    if (!mood || !productivity) {
        return res.render('developmentTips', { error: 'Ruh hali ve üretkenlik seviyesi gerekli!' });
    }

    const prompt = `
    Kullanıcının ruh hali ve durumu:
    - Ruh Hali(1-5): ${mood}
    - Üretkenlik: ${productivity}

    Görev:
    1. Ruh haline ve üretkenlik seviyesine uygun kişisel gelişim önerileri sun. (Motivasyon, zaman yönetimi, hedef belirleme gibi)

    Lütfen yanıtını aşağıdaki JSON formatında döndür:
    {
        "developmentTips": [
            "Kişisel Gelişim Önerisi 1",
            "Kişisel Gelişim Önerisi 2",
            "Kişisel Gelişim Önerisi 3"
        ]
    }

    Yanıtınız sadece bu yapıyı takip etsin ve bu format dışında herhangi bir içerik döndürmesin.
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates[0].content.parts[0].text.trim();
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        const jsonResponse = JSON.parse(cleanedResponse);

        // EJS'ye gönderilecek yanıt
        res.render('personalTips', {
            tips: jsonResponse.developmentTips,
            mood,
            productivity
        });
    } catch (error) {
        console.error('Gemini API hatası:', error);
        res.render('developmentTips', { error: 'Gemini API ile iletişimde hata oluştu.' });
    }
};

const generateSocialSuggestions = async (req, res) => {
  const { mood, socialInteraction } = req.body;

  // Eğer kullanıcı bir değer girmezse hata döndürüyoruz
  if (!mood || !socialInteraction) {
      return res.status(400).json({ error: 'Ruh hali ve sosyal etkileşim durumu gerekli!' });
  }

  const prompt = `
  Kullanıcının ruh hali ve durumu:
  - Ruh Hali(1-5): ${mood}
  - Sosyal Etkileşim: ${socialInteraction}

  Görev:
  1. Ruh haline ve sosyal etkileşim seviyesine uygun sosyal etkileşim arttırıcı önerilerde bulun.
  2. Sosyal etkileşim için uygun aktiviteler öner.

  Lütfen yanıtını aşağıdaki JSON formatında döndür:
  {
      "socialSuggestions": [
          "Öneri 1: Aktivite önerisi veya sosyal etkileşim önerisi.",
          "Öneri 2: Aktivite önerisi veya sosyal etkileşim önerisi.",
          "Öneri 3: Aktivite önerisi veya sosyal etkileşim önerisi."
      ]
  }

  Yanıtınız sadece bu yapıyı takip etsin ve bu format dışında herhangi bir içerik döndürmesin.
  `;

  try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.candidates[0].content.parts[0].text.trim();
      const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
      const jsonResponse = JSON.parse(cleanedResponse);

      // Önerileri render ederek gönderiyoruz
      return res.render("social", { exercises: jsonResponse });
  } catch (error) {
      console.error('Gemini API hatası:', error);
      return res.status(500).json({ error: 'Gemini API ile iletişimde hata oluştu.' });
  }
};


/**
 * bir fonskiyon işlevi mood aldığı günden itibaren (kullanıcının moodunu girdiği
 * günler) tüm ay için bir durum motivasyonlu falan özet, model kendini eğitcek 
 * diğer fonksiyonlardan daha karışık olsun  
 */


module.exports = {
  generateSuggestions,
  generateExerciseSuggestions,
  generateDevelopmentTips,
  generateSocialSuggestions
};
