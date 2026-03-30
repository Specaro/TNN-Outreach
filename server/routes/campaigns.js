const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET all campaigns
router.get('/', (req, res) => {
  const db = getDb();
  const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY created_at DESC').all();
  res.json(campaigns);
});

// GET single campaign with logs
router.get('/:id', (req, res) => {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const logs = db.prepare(`
    SELECT el.*, c.name as contact_name_ref
    FROM email_logs el
    LEFT JOIN contacts c ON el.contact_id = c.id
    WHERE el.campaign_id = ?
    ORDER BY el.sent_at DESC
  `).all(req.params.id);

  res.json({ ...campaign, logs });
});

// POST create campaign (draft)
router.post('/', (req, res) => {
  const db = getDb();
  const { name, subject, template_id, custom_message, recipient_type, selected_contacts } = req.body;
  if (!name || !subject || !template_id) {
    return res.status(400).json({ error: 'Name, subject, and template are required' });
  }

  const result = db.prepare(`
    INSERT INTO campaigns (name, subject, template_id, custom_message, recipient_type, selected_contacts)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(name, subject, template_id, custom_message || '',
    recipient_type || 'all',
    selected_contacts ? JSON.stringify(selected_contacts) : null);

  const created = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT update campaign
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, subject, template_id, custom_message, recipient_type, selected_contacts } = req.body;

  db.prepare(`
    UPDATE campaigns SET name=?, subject=?, template_id=?, custom_message=?,
    recipient_type=?, selected_contacts=? WHERE id=?
  `).run(name, subject, template_id, custom_message || '',
    recipient_type || 'all',
    selected_contacts ? JSON.stringify(selected_contacts) : null,
    req.params.id);

  const updated = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE campaign
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM email_logs WHERE campaign_id = ?').run(req.params.id);
  db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET campaign stats summary
router.get('/stats/summary', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as n FROM campaigns').get().n;
  const sent = db.prepare("SELECT COUNT(*) as n FROM campaigns WHERE status='sent'").get().n;
  const totalEmailsSent = db.prepare("SELECT COALESCE(SUM(sent_count),0) as n FROM campaigns").get().n;
  res.json({ total, sent, totalEmailsSent });
});

module.exports = router;
