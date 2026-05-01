// ============================================
// error.middleware.js - Global Error Handling
// ============================================

// Middleware function
export const notFoundHandler = (
  req,
  res,
  next
) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Global error handler
export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  console.error('FULL ERROR:', err);

  res.status(
    err.statusCode || 500
  ).json({
    success: false,
    message:
      err.message ||
      'Something went wrong on the server.',

    stack:
      process.env.NODE_ENV ===
      'development'
        ? err.stack
        : undefined,
  });
};

