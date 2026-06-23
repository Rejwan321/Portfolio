const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'messages.json');

function readMessages() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveMessages(messages) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });
}

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  const messages = readMessages();
  const newMessage = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  saveMessages(messages);

  const transporter = createTransporter();
  if (transporter) {
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: 'rejwan.azam.mondal321@gmail.com',
      replyTo: email.trim(),
      subject: `New message from ${name.trim()} — Portfolio`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:10px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#8c00ff,#5500cc);padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">New Portfolio Message</h1>
          </div>
          <div style="padding:30px;background:#fff;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;font-weight:bold;color:#8c00ff;width:100px;">From:</td><td style="padding:10px 0;color:#333;">${name.trim()}</td></tr>
              <tr><td style="padding:10px 0;font-weight:bold;color:#8c00ff;">Email:</td><td style="padding:10px 0;"><a href="mailto:${email.trim()}" style="color:#333;">${email.trim()}</a></td></tr>
              <tr><td style="padding:10px 0;font-weight:bold;color:#8c00ff;vertical-align:top;">Message:</td><td style="padding:10px 0;color:#333;line-height:1.6;">${message.trim().replace(/\n/g, '<br>')}</td></tr>
            </table>
          </div>
          <div style="padding:20px;background:#f0f0f0;text-align:center;font-size:12px;color:#888;">
            Sent via your portfolio at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('Email send error:', err.message);
    }
  } else {
    console.warn('Email not configured — set GMAIL_USER and GMAIL_APP_PASSWORD secrets to enable email delivery.');
  }

  res.json({ success: true, message: "Thanks for reaching out! I'll get back to you soon." });
});

app.get('/api/messages', (req, res) => {
  const messages = readMessages();
  res.json({ success: true, count: messages.length, messages });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio server running on port ${PORT}`);
  if (!process.env.GMAIL_USER) {
    console.log('Tip: Add GMAIL_USER and GMAIL_APP_PASSWORD secrets to enable email notifications.');
  }
});