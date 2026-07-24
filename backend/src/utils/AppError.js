class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;

// Route
//   ↓
// Controller
//   ↓
// Service
//   ↓
// Error occurs
//   ↓
// next(error)
//   ↓
// Global Error Middleware
//   ↓
// Consistent JSON Response