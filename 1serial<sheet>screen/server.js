// server.js
// A very simple Express + Socket.IO server that talks to the Arduino BOTH ways:
//   - READS one number (0-255) from the serial port and sends it to the browser.
//   - RECEIVES a number from the browser (the Google Sheet value) and WRITES it to serial.

// 1) Import the libraries we need
const express = require('express');                                 // web server
const http = require('http');                                       // lets Express share a server with Socket.IO
const { Server } = require('socket.io');                            // real-time messages to/from the browser
const { SerialPort } = require('serialport');                       // talks to the serial port
const { ReadlineParser } = require('@serialport/parser-readline');  // reads one line at a time

// 2) Create the Express app and wrap it in an HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 3) Serve the files in the "public" folder (this is where index.html lives)
app.use(express.static('public'));

// 4) Open the serial port.
//    CHANGE the "path" to match your board:
//    - Windows: "COM3", "COM4", ...
//    - Mac:     "/dev/cu.usbmodem11301"
//    - Linux:   "/dev/ttyACM0" or "/dev/ttyUSB0"
const port = new SerialPort({
  path: '/dev/cu.usbmodem11301',
  baudRate: 9600,   // must match the baud rate used by your Arduino sketch
});

// 5) Set up a parser that gives us one full line at a time (splits on "\n")
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// 6) ARDUINO -> BROWSER: every time a full line arrives from the Arduino...
parser.on('data', (line) => {
  const value = Number(line.trim());   // turn the text "123" into the number 123
  if (!isNaN(value)) {
    console.log('From Arduino:', value);
    io.emit('serialData', value);      // send it to every connected browser
  }
});

// 7) BROWSER -> ARDUINO: when a browser sends us the Google Sheet value,
//    write it out to the serial port so the Arduino can use it.
io.on('connection', (socket) => {
  console.log('A browser connected.');

  socket.on('sheetValue', (value) => {
    const n = Number(value);
    if (!isNaN(n)) {
      port.write(n + '\n');            // send the number to the Arduino, ending with a newline
      console.log('To Arduino:', n);
    }
  });
});

// 8) Let us know if something goes wrong with the serial port
port.on('error', (err) => {
  console.log('Serial port error:', err.message);
});

// 9) Start the web server on port 3000
server.listen(3000, () => {
  console.log('Server running! Open http://localhost:3000 in your browser.');
});
