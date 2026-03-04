import { createServer } from 'node:http';

const PORT = process.env.HEALTH_PORT || 8080;

const server = createServer((req, res) => {
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        stripe_webhook: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'unconfigured',
        pi_forward: process.env.FORWARD_URL ? 'configured' : 'unconfigured',
      },
    }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Health server on :${PORT}`);
});
