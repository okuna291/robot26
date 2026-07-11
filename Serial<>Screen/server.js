// server.js
// A very simple Express + Socket.IO server.
// It reads three comma-separated numbers (0-255) from the serial port
// and sends them to any web browser connected to this server.

// 1) Import the libraries we need
const express = require('express');                                 // web server
const http = require('http');                                       // lets Express share a server with Socket.IO
const { Server } = require('socket.io');                            // sends real-time messages to the browser
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
//    - Mac:     "/dev/tty.usbmodemXXXX"
//    - Linux:   "/dev/ttyACM0" or "/dev/ttyUSB0"
const port = new SerialPort({
  path: 'COM3',
  baudRate: 9600,   // must match the baud rate used by your board
});

// 5) Set up a parser that gives us one full line at a time.
//    It splits the incoming data every time it sees a newline ("\n").
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// 6) Every time a full line arrives from the serial port...
parser.on('data', (line) => {
  // "line" looks like this piece of text: "123,45,200"
  // .trim() removes stray spaces/newlines, .split(',') breaks it at the commas
  const parts = line.trim().split(',');   // -> ["123", "45", "200"]

  // Only continue if we actually received 3 values
  if (parts.length === 3) {
    const values = parts.map(Number);     // turn the text into numbers -> [123, 45, 200]

    console.log('Received:', values);     // print to the terminal so we can watch it work

    io.emit('serialData', values);        // send the 3 numbers to every connected browser
  }
});

// 7) Let us know if something goes wrong with the serial port
port.on('error', (err) => {
  console.log('Serial port error:', err.message);
});

// 8) Start the web server on port 3000
server.listen(3000, () => {
  console.log('Server running! Open http://localhost:3000 in your browser.');
});
