// index.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const moodRoutes = require('./routes/moodRoutes'); // Router'ı dahil ediyoruz
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  // views klasörünü tanıtıyoruz

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static(path.join(__dirname, 'public'))); 

// Anasayfa route'u
app.get('/mood', (req, res) => {
    res.render('index', { recommendations: null}); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get('/exercise', (req, res) => {
    res.render('exercise', { exercises: null  }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

app.get('/personal-tips', (req, res) => {
    res.render('personalTips', { tips: null,
      mood: null,
      productivity: null  }); // İlk başta recommendations 'null' olarak gönderiyoruz
});

// Router'ı uygulamaya dahil et
app.use('/', moodRoutes);

// Generic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
