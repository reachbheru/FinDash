import userService from "./user.service.js";

// ============= CREATE USER =============
export const createUser = async (req, res) => {
  console.log("Received request to create user with data:", req.validatedBody); // Debug log for incoming request data
  const response = await userService.createUser(req.validatedBody);
  console.log("Create User Response:", response); // Debug log for service response
  res.status(response.statusCode).json(response);
};

// ============= GET ALL USERS =============
export const getAllUsers = async (req, res, next) => {
  const response = await userService.getAllUsers(req);
  res.status(response.statusCode).json(response);
};

// ============= GET CURRENT USER PROFILE =============
export const getUserProfile = async (req, res, next) => {
  const response = await userService.getUserProfile(req);
  res.status(response.statusCode).json(response);
};

// ============= GET SINGLE USER =============
export const getUserById = async (req, res, next) => {
  const response = await userService.getUserById(req);
  res.status(response.statusCode).json(response);
};

// ============= UPDATE USER (Full Update) =============
export const updateUser = async (req, res, next) => {
  const response = await userService.updateUser(req);
  res.status(response.statusCode).json(response);
};

// ============= UPDATE USER PROFILE (Strict) =============
export const updateUserProfile = async (req, res, next) => {
  const response = await userService.updateUserProfile(req);
  res.status(response.statusCode).json(response);
};

// ============= UPDATE OWN PROFILE =============
export const updateOwnProfile = async (req, res, next) => {
  const response = await userService.updateOwnProfile(req);
  res.status(response.statusCode).json(response);
};

// ============= UPDATE USER ROLE AND STATUS (Admin Only) =============
export const updateUserRoleAndStatus = async (req, res, next) => {
  const response = await userService.updateUserRoleAndStatus(req);
  res.status(response.statusCode).json(response);
};

// ============= DELETE USER (Hard Delete) =============
export const deleteUser = async (req, res, next) => {
  const response = await userService.deleteUser(req);
  res.status(response.statusCode).json(response);
};

// ============= DELETE USER WITH PASSWORD (Secure Delete) =============
export const deleteUserWithPassword = async (req, res, next) => {
  const response = await userService.deleteUserWithPassword(req);
  res.status(response.statusCode).json(response);
};

// ============= SOFT DELETE USER =============
export const softDeleteUser = async (req, res, next) => {
  const response = await userService.softDeleteUser(req);
  res.status(response.statusCode).json(response);
};

// ============= RESTORE SOFT DELETED USER =============
export const restoreUser = async (req, res, next) => {
  const response = await userService.restoreUser(req);
  res.status(response.statusCode).json(response);
};

// ============= BULK DELETE USERS =============
export const bulkDeleteUsers = async (req, res, next) => {
  const response = await userService.bulkDeleteUsers(req);
  res.status(response.statusCode).json(response);
};

// ============= GET USER STATISTICS =============
export const getUserStatistics = async (req, res, next) => {
  const response = await userService.getUserStatistics(req);
  res.status(response.statusCode).json(response);
};

// ============= SEARCH USERS =============
export const searchUsers = async (req, res, next) => {
  const response = await userService.searchUsers(req);
  res.status(response.statusCode).json(response);
};

// ============= LOGIN USER =============
export const loginUser = async (req, res, next) => {
  console.log("Received login request with email:", req.validatedBody.email);
  const response = await userService.loginUser(req.validatedBody);
  console.log("Login Response:", response);
  res.status(response.statusCode).json(response);
};

// ============= REFRESH TOKEN =============
export const refreshToken = async (req, res, next) => {
  console.log("Received refresh token request");
  const response = await userService.refreshTokens(req);
  res.status(response.statusCode).json(response);
};
