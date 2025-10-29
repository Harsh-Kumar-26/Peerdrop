const errorHandler = (err, req, res, next) => {
    console.log('statusCode:', err.statusCode);
    console.log('Error caught:', err);
  res.status(err.statusCode || 500).json({
    success: err.success || false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: err.data || null,
    stack: err.stack || null
  });
};

export default errorHandler;