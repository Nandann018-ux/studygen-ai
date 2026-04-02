const dotenv = require('dotenv');
const path = require('path');

// Load .env from the server directory explicitly
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5001;

/**
 * Startup Protocol: Connect DB -> Listen on Port
 */
async function startNeuralBackend() {
  try {
    console.log('>> Synchronizing with Neural Database...');
    await connectDB(); 
    console.log('>> Database connection established.');

    app.listen(PORT, () => {
      console.log(`\x1b[32m%s\x1b[0m`, `>> Neural Backend active on port: ${PORT}`);
      console.log(`>> Health Check: http://127.0.0.1:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '!! Failed to start Neural Backend:', error.message);
    process.exit(1);
  }
}

startNeuralBackend();