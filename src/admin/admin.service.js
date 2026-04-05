import User from "../user/schema/user.schema.js";
import { AppError } from "../middlewares/errorHandler.js";
import { generateTokens } from "../common/jwt.js";
import logger from "../common/logger.js";

class AdminService {
  // ============= ADMIN REGISTER =============
  async adminRegister(registerData) {
    const { confirmPassword, adminSecret, ...adminDataWithoutConfirm } =
      registerData;

    // Verify admin secret key
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
    if (!ADMIN_SECRET_KEY) {
      logger.error(
        "Admin registration failed",
        "ADMIN_SECRET_KEY not configured in environment",
      );
      throw new AppError("Admin registration is not configured", 500);
    }

    if (adminSecret !== ADMIN_SECRET_KEY) {
      logger.authFailed(registerData.email, "invalid admin secret key");
      throw new AppError("Invalid admin secret key", 401);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: registerData.email });
    if (existingUser) {
      logger.error(
        "Admin registration failed",
        `Email already exists: ${registerData.email}`,
      );
      throw new AppError("User with this email already exists", 409);
    }

    // Verify passwords match
    if (registerData.password !== confirmPassword) {
      logger.error("Admin registration failed", "Passwords do not match");
      throw new AppError("Passwords don't match", 400);
    }

    // Create admin user with admin role
    const newAdmin = new User({
      ...adminDataWithoutConfirm,
      role: "admin",
      status: "active",
    });
    await newAdmin.save();

    logger.userCreated(newAdmin.email, newAdmin._id);
    logger.success(`Admin account created: ${newAdmin.email}`);

    // Return user without password
    const { password, ...adminWithoutPassword } = newAdmin.toObject();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      newAdmin._id.toString(),
      newAdmin.email,
      newAdmin.role,
    );

    logger.tokenGenerated(newAdmin.email);

    return {
      success: true,
      message: "Admin account created successfully",
      data: {
        user: adminWithoutPassword,
        accessToken,
        refreshToken,
      },
      statusCode: 201,
    };
  }

  // ============= ADMIN LOGIN =============
  async adminLogin(loginData) {
    const { email, password } = loginData;

    // Check if user exists and is admin
    const admin = await User.findOne({ email, role: "admin" });
    if (!admin || admin.isDeleted) {
      logger.authFailed(email, "admin not found or deleted");
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      logger.authFailed(email, "invalid password");
      throw new AppError("Invalid email or password", 401);
    }

    logger.authSuccess(admin.email, "logged in as admin");

    // Return user without password
    const { password: pwd, ...adminWithoutPassword } = admin.toObject();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      admin._id.toString(),
      admin.email,
      admin.role,
    );

    logger.tokenGenerated(admin.email);

    return {
      success: true,
      message: "Admin login successful",
      data: {
        user: adminWithoutPassword,
        accessToken,
        refreshToken,
      },
      statusCode: 200,
    };
  }

  // ============= GET ADMIN DASHBOARD =============
  async getAdminDashboard(req) {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get total counts
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const adminCount = await User.countDocuments({
      role: "admin",
      isDeleted: false,
    });
    const analystCount = await User.countDocuments({
      role: "analyst",
      isDeleted: false,
    });
    const viewerCount = await User.countDocuments({
      role: "viewer",
      isDeleted: false,
    });
    const activeCount = await User.countDocuments({
      status: "active",
      isDeleted: false,
    });
    const inactiveCount = await User.countDocuments({
      status: "inactive",
      isDeleted: false,
    });
    const suspendedCount = await User.countDocuments({
      status: "suspended",
      isDeleted: false,
    });

    // Get recent users
    const recentUsers = await User.find({ isDeleted: false })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    logger.success("Admin dashboard retrieved");

    return {
      success: true,
      message: "Admin dashboard retrieved successfully",
      data: {
        summary: {
          totalUsers,
          byRole: {
            admin: adminCount,
            analyst: analystCount,
            viewer: viewerCount,
          },
          byStatus: {
            active: activeCount,
            inactive: inactiveCount,
            suspended: suspendedCount,
          },
        },
        recentUsers,
      },
      statusCode: 200,
    };
  }
}

export default new AdminService();
