export const validateInput = (schema) => (req, res, next) => {
  try {
    console.log("InputValidator: Validating req.body:", req.body);
    const validatedData = schema.parse(req.body);
    req.validatedBody = validatedData;
    console.log("Validated Data:", validatedData); // Debug log for validated data
    next();
  } catch (err) {
    console.error("InputValidator Error:", err.errors);
    return res.status(400).json({
      success: false,
      message: err.errors ? err.errors[0].message : "Invalid request data",
      statusCode: 400,
    });
  }
};
