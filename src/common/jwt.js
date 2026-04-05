import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "30d";

export const generateTokens = (userId, email, role) => {
  try {
    const accessToken = jwt.sign({ userId, email, role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    const refreshToken = jwt.sign({ userId, email }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRE,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const { userId, email } = decoded;

    // Get role from database (you'll need to fetch user)
    const accessToken = jwt.sign(
      { userId, email, role: decoded.role || "viewer" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE },
    );

    return accessToken;
  } catch (error) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
};

export const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};
