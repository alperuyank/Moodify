require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const photoController = require("./controllers/photoController");
const audioController = require("./controllers/audioController");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  const upload = multer({ storage: storage });

// Routes
app.get("/", (req, res) => res.render("index")); // Fotoğraf yükleme sayfası
app.post("/upload", photoController.uploadPhoto); // Fotoğraf yükleme ve analiz
// Ses analizi rotası
app.post("/analyze-audio", upload.single("audio"), audioController.analyzeAudioFile);

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Running http://localhost:${PORT}.`);
});
