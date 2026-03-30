const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET all settings
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  // Never expose password in response
  if (settings.smtp_pass) settings.smtp_pass = settings.smtp_pass ? '••••••••' : '';
  res.json(settings);
});

// PUT update settings
router.put('/', (req, res) => {
  const db = getDb();
  const allowed = [
    'smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_pass',
    'from_name', 'from_email', 'company_name', 'company_phone',
    'company_website', 'company_tagline',
  ];

  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const updateMany = db.transaction((data) => {
    for (const key of allowed) {
      if (key in data) {
        // Don't overwrite password if placeholder was sent
        if (key === 'smtp_pass' && data[key] === '••••••••') continue;
        upsert.run(key, data[key]);
      }
    }
  });

  updateMany(req.body);

  const rows = db.prepare('SELECT key, value FROM settings').all();
  const settings = Object.fromEntries(rows.map(r => [r.key, r.value]));
  if (settings.smtp_pass) settings.smtp_pass = '••••••••';
  res.json(settings);
});

module.exports = router;
