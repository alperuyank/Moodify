// index.js
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const moodRoutes = require("./routes/moodRoutes"); // Router'ı dahil ediyoruz
const app = express();
const connectDB = require("./config/db"); 
const { exec } = require("child_process");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // views klasörünü tanıtıyoruz

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static('uploads'));

//connectDB();

app.get('/analyze', (req, res) => {
  const imageName = req.query.image || 'angry.jpeg';  // Varsayılan olarak 'angry.jpeg'
  const imagePath = path.resolve(__dirname, 'public', 'images', imageName);

  // Resmin mevcut olup olmadığını kontrol et
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${imagePath}`);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Python scriptinin tam yolu
    const pythonScriptPath = path.resolve(__dirname, 'scripts', 'face-expression.py');

    // Python scriptini çalıştırma
    exec(`python "${pythonScriptPath}" "${imagePath}"`, (error, stdout, stderr) => {
      console.log("Python stdout:", stdout);  // Python çıktısını konsola yazdır
      console.error("Python stderr:", stderr);  // Python hata çıktısını konsola yazdır

      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ error: 'Python script error', details: error.message });
      }

      // Sadece stderr'de gerçek bir hata varsa dikkate al
      // if (stderr && !stderr.includes('oneDNN custom operations')) {
      //   console.error(`stderr: ${stderr}`);
      //   return res.status(500).json({ error: 'Python script stderr', details: stderr });
      // }

      try {
        const result = JSON.parse(stdout);  // Python çıktısını JSON formatında işliyoruz
        res.json(result);  // JSON olarak döndürüyoruz
      } catch (e) {
        console.error('Error parsing JSON:', e);
        res.status(500).json({ error: 'Error parsing JSON from Python script' });
      }
    });
  });
});


// Anasayfa route'u
app.get("/mood", (req, res) => {
  res.render("suggestion", { recommendations: null }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get("/exercise", (req, res) => {
  res.render("exercise", { exercises: null }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get("/personal-tips", (req, res) => {
  res.render("personalTips", { tips: null, mood: null, productivity: null }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get("/social-tips", (req, res) => {
  res.render("social", { exercises: null }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get('/analyze' , (req, res) => {
  res.render('analyze', {result: null});
})


app.get('/', (req, res) => {
  res.render('index');
})

app.use('/', moodRoutes);


// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
