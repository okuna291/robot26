// server.js
// Reads analog values from the Arduino and serves a live webpage.
//
// Install deps:
//   npm install express serialport @serialport/parser-readline
//
// Run:
//   node server.js
// Then open:  http://localhost:3000
//
// The Arduino sketch just does Serial.println(analogRead(A0)) at 9600 baud.

const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// ---- Config ----------------------------------------------------------------
const HTTP_PORT = 3000;

// ⚠️ Change this to your Arduino's port:
//   Linux/Pi: /dev/ttyACM0  (or /dev/ttyUSB0)
//   macOS:    /dev/tty.usbmodem14101  (or tty.usbserial-XXXX)
//   Windows:  COM3
const SERIAL_PATH = '/dev/cu.usbmodem11401';
const BAUD_RATE = 9600; // must match Serial.begin(9600)

// ---- Express + static files ------------------------------------------------
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// ---- Server-Sent Events: keep a list of connected browser clients ----------
let clients = [];

app.get('/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  // Send a comment to open the stream
  res.write(': connected\n\n');

  const client = res;
  clients.push(client);
  console.log(`Browser connected (${clients.length} total)`);

  req.on('close', () => {
    clients = clients.filter((c) => c !== client);
    console.log(`Browser disconnected (${clients.length} total)`);
  });
});

function broadcast(value) {
  const payload = `data: ${JSON.stringify({ value, t: Date.now() })}\n\n`;
  clients.forEach((c) => c.write(payload));
}

// ---- Serial port -----------------------------------------------------------
const serial = new SerialPort({ path: SERIAL_PATH, baudRate: BAUD_RATE });
const parser = serial.pipe(new ReadlineParser({ delimiter: '\r\n' }));

serial.on('open', () => {
  console.log(`Serial port ${SERIAL_PATH} open at ${BAUD_RATE} baud`);
});

parser.on('data', (line) => {
  const value = parseInt(line, 10); // analogRead → 0–1023
  if (!Number.isNaN(value)) {
    console.log('A0:', value);
    broadcast(value);
  }
});

serial.on('error', (err) => {
  console.error('Serial error:', err.message);
  console.error('Is SERIAL_PATH correct? Try: npx @serialport/list');
});

// ---- Start -----------------------------------------------------------------
app.listen(HTTP_PORT, () => {
  console.log(`Webpage:  http://localhost:${HTTP_PORT}`);
});

