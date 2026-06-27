const http = require('http');
const { exec } = require('child_process');

http.createServer((req, res) => {
  // Measures Raspberry Pi CPU temperature
  exec('vcgencmd measure_temp', (err, stdout, stderr) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    if (err) return res.end('Error reading temperature');
    res.end(`Pi Temperature: ${stdout.trim()}`);
  });
}).listen(3000);
