import adminService from "./admin.service.js";

// ============= ADMIN REGISTER =============
export const adminRegister = async (req, res) => {
  const response = await adminService.adminRegister(req.validatedBody);
  res.status(response.statusCode).json(response);
};

// ============= ADMIN LOGIN =============
export const adminLogin = async (req, res) => {
  const response = await adminService.adminLogin(req.validatedBody);
  res.status(response.statusCode).json(response);
};

// ============= GET ADMIN DASHBOARD =============
export const getAdminDashboard = async (req, res) => {
  const response = await adminService.getAdminDashboard(req);
  res.status(response.statusCode).json(response);
};
