const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const codeforcesRoutes = require('./routes/codeforcesRoutes');
const contestRoutes = require('./routes/contestRoutes');
const problemRoutes = require('./routes/problemRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/contests', contestRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/problems', problemRoutes);
app.get('/api/health', (req, res) => res.json({ ok: true, message: 'Competitive Helper API is running' }));

app.use(errorHandler);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
