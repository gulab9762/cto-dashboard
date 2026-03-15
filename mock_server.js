const http = require('http');

const port = process.env.PORT || 4000;

const mockResponse = {
  "data": {
    "organization": {
      "metrics": {
        "prsMerged": 15,
        "averageCycleTime": 24.5,
        "reviewCount": 30
      }
    }
  }
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle any path (including /graphql)
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    console.log(`${req.method} ${req.url}`, body ? `Body: ${body}` : '');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mockResponse));
  });
});

server.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}/`);
});
