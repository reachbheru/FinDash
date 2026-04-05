const asyncHandler = (fn) => async (req, res, next) => {
  try {
    console.log("AsyncHandler: Executing handler");
    await fn(req, res, next);
  } catch (err) {
    console.error("AsyncHandler: Error caught:", err);
    next(err);
  }
};

export default asyncHandler;
