const mongoose = require('mongoose');
const dotenv = require('dotenv');

// .env dosyasındaki çevre değişkenlerini yükleme
dotenv.config();

// MongoDB Atlas bağlantı URL'sini al
const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas bağlantısı başarılı!');
  } catch (error) {
    console.error('MongoDB bağlantısı başarısız:', error);
    process.exit(1); // Bağlantı hatası varsa uygulamayı sonlandır
  }
};

// Bağlantıyı dışarıya aktarıyoruz
module.exports = connectDB;
