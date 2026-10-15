require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';
const PROFILE_FILE = path.join(__dirname, 'data', 'profile.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');

if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'));
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]');

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

app.get('/api/profile', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Could not load profile data.' });
  }
});

app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, message } = req.body;
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required.');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');
  if (errors.length) return res.status(400).json({ error: errors.join(' ') });

  const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  const newMsg = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    date: new Date().toISOString(),
    read: false
  };
  messages.push(newMsg);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  console.log(`📩 ${newMsg.name} <${newMsg.email}>`);
  res.json({ success: true, message: "Thanks! I'll get back to you soon." });
});

const adminAuth = (req, res, next) => {
  const key = req.query.key || req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

app.get('/api/messages', adminAuth, (req, res) => {
  const msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  res.json(msgs.sort((a, b) => new Date(b.date) - new Date(a.date)));
});

app.delete('/api/messages/:id', adminAuth, (req, res) => {
  let msgs = JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf-8'));
  msgs = msgs.filter(m => m.id !== req.params.id);
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(msgs, null, 2));
  res.json({ success: true });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n✅ http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin.html?key=${ADMIN_KEY}\n`);
});
