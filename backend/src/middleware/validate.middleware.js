const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details
        .map((detail) => detail.message)
        .join(", ");

      return res.status(400).json({
        success: false,
        message,
      });
    }

    req.body = value;

    next();
  };
};

export default validate;


// Client Request
//       ↓
// Validation Middleware
//       ↓
// Valid?
//   ├── No → 400 Error
//   │
//   └── Yes
//        ↓
//     Controller