const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET all contacts
router.get('/', (req, res) => {
  const db = getDb();
  const { type, search, active } = req.query;
  let query = 'SELECT * FROM contacts WHERE 1=1';
  const params = [];

  if (type && type !== 'all') {
    query += ' AND type = ?';
    params.push(type);
  }
  if (active !== undefined) {
    query += ' AND active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  if (search) {
    query += ' AND (name LIKE ? OR city LIKE ? OR contact_person LIKE ? OR email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }
  query += ' ORDER BY type, name';

  const contacts = db.prepare(query).all(...params);
  res.json(contacts);
});

// GET single contact
router.get('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// POST create contact
router.post('/', (req, res) => {
  const db = getDb();
  const { name, type, address, city, state, phone, email, contact_person, title, notes } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });

  const result = db.prepare(`
    INSERT INTO contacts (name, type, address, city, state, phone, email, contact_person, title, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, type, address, city, state, phone, email, contact_person, title, notes);

  const created = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT update contact
router.put('/:id', (req, res) => {
  const db = getDb();
  const { name, type, address, city, state, phone, email, contact_person, title, notes, active } = req.body;

  db.prepare(`
    UPDATE contacts SET name=?, type=?, address=?, city=?, state=?, phone=?, email=?,
    contact_person=?, title=?, notes=?, active=? WHERE id=?
  `).run(name, type, address, city, state, phone, email, contact_person, title, notes,
    active !== undefined ? (active ? 1 : 0) : 1, req.params.id);

  const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE contact
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// PATCH toggle active status
router.patch('/:id/toggle', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });

  db.prepare('UPDATE contacts SET active = ? WHERE id = ?').run(contact.active ? 0 : 1, req.params.id);
  const updated = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// GET contacts stats
router.get('/stats/summary', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as n FROM contacts').get().n;
  const hospitals = db.prepare("SELECT COUNT(*) as n FROM contacts WHERE type='hospital'").get().n;
  const nursingHomes = db.prepare("SELECT COUNT(*) as n FROM contacts WHERE type='nursing_home'").get().n;
  const active = db.prepare('SELECT COUNT(*) as n FROM contacts WHERE active=1').get().n;
  res.json({ total, hospitals, nursingHomes, active });
});

module.exports = router;
