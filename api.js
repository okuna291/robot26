const http = require('http');
const os = require('os');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  const stats = {
    platform: os.platform(),
    uptime: os.uptime(),
    time: new Date().toLocaleTimeString()
  };
  res.end(JSON.stringify(stats));
}).listen(3000);
