const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server directory explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./src/config/db');

if (!process.env.MONGO_URI) {
  console.warn('Warning: `MONGO_URI` is undefined. MongoDB connection will fail.');
}

const PORT = process.env.PORT || 5001;

(async () => {
  try {
    await connectDB(); 
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();