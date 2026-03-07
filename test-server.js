import http from 'node:http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <h1>Hostinger Node.js Test</h1>
    <p>Server is running!</p>
    <ul>
      <li>Node version: ${process.version}</li>
      <li>PORT: ${PORT}</li>
      <li>NODE_ENV: ${process.env.NODE_ENV || 'not set'}</li>
      <li>Time: ${new Date().toISOString()}</li>
    </ul>
  `);
});

server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
