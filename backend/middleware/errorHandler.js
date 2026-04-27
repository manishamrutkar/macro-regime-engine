module.exports = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({
    error:   err.message || 'Internal Server Error',
    path:    req.path,
    method:  req.method,
  });
};
