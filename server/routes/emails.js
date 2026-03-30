const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { getDb } = require('../db/database');
const { getTemplate, TEMPLATE_META } = require('../templates/emailTemplates');

function getSmtpConfig(db) {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    host: s.smtp_host || 'smtp.gmail.com',
    port: parseInt(s.smtp_port || '587'),
    secure: s.smtp_secure === 'true',
    auth: { user: s.smtp_user || '', pass: s.smtp_pass || '' },
    fromName: s.from_name || 'TNN Staffing Solutions',
    fromEmail: s.from_email || s.smtp_user || '',
    companyName: s.company_name || 'TNN Staffing Solutions',
    companyPhone: s.company_phone || '',
    companyWebsite: s.company_website || '',
    companyTagline: s.company_tagline || 'Your Trusted Partner in Healthcare Staffing',
  };
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.auth.user, pass: config.auth.pass },
  });
}

// GET all available templates metadata
router.get('/templates', (req, res) => {
  res.json(TEMPLATE_META);
});

// POST preview an email template
router.post('/preview', (req, res) => {
  const db = getDb();
  const { template_id, custom_message, contact_name } = req.body;
  const config = getSmtpConfig(db);

  const html = getTemplate(template_id, {
    companyName: config.companyName,
    companyTagline: config.companyTagline,
    companyPhone: config.companyPhone,
    companyWebsite: config.companyWebsite,
    contactName: contact_name || 'Healthcare Partner',
    customMessage: custom_message || '',
  });

  res.json({ html });
});

// POST test SMTP connection
router.post('/test-connection', async (req, res) => {
  const db = getDb();
  const config = getSmtpConfig(db);

  if (!config.auth.user || !config.auth.pass) {
    return res.status(400).json({ success: false, error: 'SMTP credentials not configured. Please update Settings first.' });
  }

  try {
    const transporter = createTransporter(config);
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful!' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST send test email
router.post('/send-test', async (req, res) => {
  const db = getDb();
  const { to_email } = req.body;
  if (!to_email) return res.status(400).json({ error: 'Recipient email required' });

  const config = getSmtpConfig(db);
  if (!config.auth.user || !config.auth.pass) {
    return res.status(400).json({ error: 'SMTP credentials not configured. Please update Settings first.' });
  }

  const html = getTemplate('introduction', {
    companyName: config.companyName,
    companyTagline: config.companyTagline,
    companyPhone: config.companyPhone,
    companyWebsite: config.companyWebsite,
    contactName: 'Test Recipient',
    customMessage: 'This is a test email sent from your TNN Outreach system.',
  });

  try {
    const transporter = createTransporter(config);
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: to_email,
      subject: `[TEST] Introduction from ${config.companyName}`,
      html,
    });
    res.json({ success: true, message: `Test email sent to ${to_email}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST send campaign
router.post('/send-campaign/:campaignId', async (req, res) => {
  const db = getDb();
  const campaign = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.campaignId);
  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const config = getSmtpConfig(db);
  if (!config.auth.user || !config.auth.pass) {
    return res.status(400).json({ error: 'SMTP credentials not configured. Please update Settings first.' });
  }

  // Determine recipients
  let contacts = [];
  if (campaign.recipient_type === 'all') {
    contacts = db.prepare("SELECT * FROM contacts WHERE active=1 AND email != '' AND email IS NOT NULL").all();
  } else if (campaign.recipient_type === 'hospitals') {
    contacts = db.prepare("SELECT * FROM contacts WHERE active=1 AND type='hospital' AND email != '' AND email IS NOT NULL").all();
  } else if (campaign.recipient_type === 'nursing_homes') {
    contacts = db.prepare("SELECT * FROM contacts WHERE active=1 AND type='nursing_home' AND email != '' AND email IS NOT NULL").all();
  } else if (campaign.recipient_type === 'custom' && campaign.selected_contacts) {
    const ids = JSON.parse(campaign.selected_contacts);
    if (ids.length > 0) {
      const placeholders = ids.map(() => '?').join(',');
      contacts = db.prepare(`SELECT * FROM contacts WHERE id IN (${placeholders}) AND email != '' AND email IS NOT NULL`).all(...ids);
    }
  }

  if (contacts.length === 0) {
    return res.status(400).json({ error: 'No contacts with email addresses found for the selected recipients.' });
  }

  const transporter = createTransporter(config);
  const logInsert = db.prepare(`
    INSERT INTO email_logs (campaign_id, contact_id, contact_name, contact_email, status, error)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  let sentCount = 0;
  let failedCount = 0;
  const results = [];

  for (const contact of contacts) {
    const html = getTemplate(campaign.template_id, {
      companyName: config.companyName,
      companyTagline: config.companyTagline,
      companyPhone: config.companyPhone,
      companyWebsite: config.companyWebsite,
      contactName: contact.contact_person || contact.name,
      customMessage: campaign.custom_message || '',
    });

    try {
      await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: contact.email,
        subject: campaign.subject,
        html,
      });
      logInsert.run(campaign.id, contact.id, contact.name, contact.email, 'sent', null);
      sentCount++;
      results.push({ contact: contact.name, email: contact.email, status: 'sent' });
    } catch (err) {
      logInsert.run(campaign.id, contact.id, contact.name, contact.email, 'failed', err.message);
      failedCount++;
      results.push({ contact: contact.name, email: contact.email, status: 'failed', error: err.message });
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  // Update campaign status
  db.prepare(`
    UPDATE campaigns SET status='sent', recipients_count=?, sent_count=?, failed_count=?, sent_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(contacts.length, sentCount, failedCount, campaign.id);

  res.json({
    success: true,
    total: contacts.length,
    sent: sentCount,
    failed: failedCount,
    results,
  });
});

module.exports = router;
