/**
 * Production logger using winston
 * Logs to console in dev, to files in production
 * Cloud platforms (Railway/Render) capture stdout automatically
 */
const { createLogger, format, transports } = require('winston');
const path = require('path');

const { combine, timestamp, errors, json, colorize, simple } = format;

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    isProduction ? json() : combine(colorize(), simple())
  ),
  defaultMeta: {
    service: 'macro-regime-backend',
    version: process.env.npm_package_version || '2.0.0',
  },
  transports: [
    // Always log to stdout (captured by cloud platforms)
    new transports.Console(),
  ],
});

// In production, also log errors to a file if writable
if (isProduction) {
  try {
    logger.add(new transports.File({
      filename: '/tmp/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    }));
  } catch (e) {
    // /tmp might not be writable on all platforms — that's fine
  }
}

module.exports = logger;
