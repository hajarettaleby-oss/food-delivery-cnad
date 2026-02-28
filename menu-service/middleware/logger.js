const logger = (req, res, next) => {
 const start = Date.now();
 res.on('finish', () => {
  const duration = Date.now() - start;
  const correlationId = req.headers['x-correlation-id'] || 'N/A';

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
      `→ ${res.statusCode} (${duration}ms) | Service: menu-service | CorrelationID: ${correlationId}`
    );
  });
 next();
};
module.exports = logger;