const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;
const { MONGODB_URI, JWT_SECRET } = process.env;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required in .env');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in .env');
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
