const multer = require('multer');
const path = require('path');
const axios = require('axios'); // Fotoğrafı başka bir API'ye POST etmek için axios kullanacağız

// Multer ile dosya yükleme ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Dosyanın kaydedileceği klasör
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Dosyanın ismi benzersiz olacak
  }
});

const upload = multer({ storage: storage }).single('photo'); // 'photo' adında bir form alanı olacak

// Fotoğraf yükleme işlemi
const uploadPhoto = (req, res) => {
    upload(req, res, (err) => {
      if (err) {
        console.error('Multer Error: ', err);
        return res.status(500).send(`Fotoğraf yüklenirken bir hata oluştu: ${err.message}`);
      }
      if (!req.file) {
        return res.status(400).send('Lütfen bir fotoğraf seçin!');
      }
  
      const photoUrl = `/uploads/${req.file.filename}`;
  
      // Fotoğrafın ismini alıyoruz
      const photoName = req.file.filename;

      
  
      // Fotoğrafı başka bir API'ye GET olarak gönderme işlemi
      axios.get(`http://localhost:5000/analyze`, {
        params: { image: photoName }  // 'image' parametresi ile fotoğrafın ismini gönderiyoruz
      })
      .then(response => {
        // Dış API'den gelen yanıtı kullanıcıya gösterme
        res.render('analyze', { result: response.data }); // analyze.ejs'ye sonucu gönderiyoruz
      })
      .catch(error => {
        console.error('Dış API hata:', error);
        res.status(500).send('Fotoğraf işlenirken bir hata oluştu.');
      });
    });
  };
  

// Fotoğraf yükleme formu sayfasını render etme
const showUploadForm = (req, res) => {
  res.render('index');  // Yükleme formunu gösteriyoruz
};

// Analiz için yüklenen fotoğrafı işleme
const analyzePhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).send('Lütfen bir fotoğraf seçin!');
  }

  const imagePath = path.resolve(__dirname, 'uploads', req.file.filename);  // Yüklenen fotoğrafın tam yolu

  // Python scriptine fotoğrafı göndermek
  const pythonScriptPath = path.resolve(__dirname, 'scripts', 'face-expression.py');

  // Python scriptini çalıştırma
  exec(`python "${pythonScriptPath}" "${imagePath}"`, (error, stdout, stderr) => {
    console.log("Python stdout:", stdout);
    console.error("Python stderr:", stderr);

    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'Python script error', details: error.message });
    }

    try {
      const result = JSON.parse(stdout);  // Python'dan gelen sonucu JSON olarak işliyoruz
      //res.render('analyze', { result });
      res.json(result);  // Sonucu JSON formatında döndürüyoruz
    } catch (e) {
      console.error('Error parsing JSON:', e);
      res.status(500).json({ error: 'Error parsing JSON from Python script' });
    }
  });
};

module.exports = {
  uploadPhoto,
  showUploadForm,
  analyzePhoto
};
