const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  if (req.url === '/') {
    res.end('Welcome to the Pi Homepage!');
  } else if (req.url === '/ayo') {
    res.end("this is ayo's page");
  } else {
    res.writeHead(404);
    res.end('Page not found.');
  }
}).listen(3000);
