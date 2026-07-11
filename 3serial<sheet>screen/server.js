// server.js
// Express + Socket.IO server that talks to the Arduino BOTH ways, with THREE values:
//   ARDUINO -> BROWSER : reads a line "r,g,b" (each 0-255) and sends it to the browser.
//   BROWSER -> ARDUINO : receives three values from the browser and writes "r,g,b" to serial.

// 1) Import the libraries we need
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// 2) Create the Express app and wrap it in an HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 3) Serve the files in the "public" folder (this is where index.html lives)
app.use(express.static('public'));

// 4) Open the serial port. CHANGE "path" to match your board.
const port = new SerialPort({
  path: '/dev/cu.usbmodem1301',
  baudRate: 9600,
});

// 5) Parser: give us one full line at a time (splits on "\n")
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// 6) ARDUINO -> BROWSER: a line like "123,45,200" arrives from the Arduino
parser.on('data', (line) => {
  const parts = line.trim().split(',');          // ["123","45","200"]
  if (parts.length === 3) {
    const values = parts.map(Number);            // [123, 45, 200]
    if (values.every((v) => !isNaN(v))) {
      console.log('From Arduino:', values);
      io.emit('serialData', values);             // send the array to every browser
    }
  }
});

// 7) BROWSER -> ARDUINO: the browser sends the three Google Sheet values
io.on('connection', (socket) => {
  console.log('A browser connected.');

  socket.on('sheetValue', (values) => {
    // "values" should be an array of three numbers, e.g. [123, 45, 200]
    if (Array.isArray(values) && values.length === 3) {
      const clean = values.map(Number);
      if (clean.every((v) => !isNaN(v))) {
        port.write(clean.join(',') + '\n');      // write "123,45,200\n" to the Arduino
        console.log('To Arduino:', clean);
      }
    }
  });
});

// 8) Report serial port problems
port.on('error', (err) => {
  console.log('Serial port error:', err.message);
});

// 9) Start the web server
server.listen(3000, () => {
  console.log('Server running! Open http://localhost:3000 in your browser.');
});
