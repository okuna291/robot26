// server.js
// Serves a page with an input box. Whatever you type gets written to serial.
//
// Install:  npm install express serialport
// Run:      node server.js
// Open:     http://localhost:3000

const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');

const HTTP_PORT = 3000;
const SERIAL_PATH = '/dev/cu.usbmodem11401'; // ← your port
const BAUD_RATE = 9600;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const serial = new SerialPort({ path: SERIAL_PATH, baudRate: BAUD_RATE });

serial.on('open', () => console.log(`Serial open: ${SERIAL_PATH}`));
serial.on('error', (err) => console.error('Serial error:', err.message));

// Receive text from the page and write it to serial
app.post('/write', (req, res) => {
  const text = req.body.text || '';
  serial.write(text, (err) => {
    if (err) return res.status(500).json({ ok: false, error: err.message });
    console.log('Wrote to serial:', JSON.stringify(text));
    res.json({ ok: true });
  });
});

app.listen(HTTP_PORT, () => console.log(`Webpage: http://localhost:${HTTP_PORT}`));

