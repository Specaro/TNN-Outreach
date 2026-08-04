require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const contactsRouter = require('./routes/contacts');
const campaignsRouter = require('./routes/campaigns');
const emailsRouter = require('./routes/emails');
const settingsRouter = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth: derive a stable token from the app password so no token DB is needed
function getToken() {
  const pw = process.env.APP_PASSWORD || 'changeme';
  return crypto.createHash('sha256').update(pw).digest('hex');
}

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const appPassword = process.env.APP_PASSWORD || 'changeme';
  if (password === appPassword) {
    return res.json({ token: getToken() });
  }
  return res.status(401).json({ error: 'Invalid password' });
});

// Auth middleware for all other /api routes
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.replace('Bearer ', '');
  if (token === getToken()) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Health check (public — App.jsx uses it to verify token on load)
app.get('/api/health', requireAuth, (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Protected API routes
app.use('/api/contacts', requireAuth, contactsRouter);
app.use('/api/campaigns', requireAuth, campaignsRouter);
app.use('/api/emails', requireAuth, emailsRouter);
app.use('/api/settings', requireAuth, settingsRouter);

// Serve built React frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TNN Outreach Server running on port ${PORT}`);
});
