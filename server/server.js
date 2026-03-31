const dotenv = require('dotenv');
dotenv.config();
const app = require('./app');
const { connectDB } = require('./src/config/db');
if (!process.env.MONGO_URI) {
  console.warn('Warning: `MONGO_URI` is undefined. MongoDB connection will fail.');
}
const PORT = process.env.PORT || 5000;
(async () => {
  await connectDB(); 
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();