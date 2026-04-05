import logger from "../common/logger.js";

const requestLogger = (req, res, next) => {
  req.startTime = Date.now();
  const ip = req.ip || req.connection.remoteAddress || "Unknown";

  // Log incoming request
  logger.incomingRequest(req.method, req.path, ip);

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - req.startTime;

    if (res.statusCode >= 400) {
      logger.requestError(
        req.method,
        req.path,
        res.statusCode,
        duration,
        data?.message || "Unknown error",
      );
    } else {
      logger.requestSuccess(req.method, req.path, res.statusCode, duration);
    }

    return originalJson(data);
  };

  next();
};

export default requestLogger;
