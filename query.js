const http = require('http');
const url = require('url');

http.createServer((req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const name = queryObject.name || 'Guest';
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end(`Hello, ${name}! Welcome to my server.\n`);
}).listen(3000);
