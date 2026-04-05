import User from "./schema/user.schema.js";
import { AppError } from "../middlewares/errorHandler.js";
import { generateTokens, refreshAccessToken } from "../common/jwt.js";
import logger from "../common/logger.js";

class UserService {
  // ============= CREATE USER =============
  async createUser(userData) {
    const { confirmPassword, ...userDataWithoutConfirm } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      logger.error(
        "User creation failed",
        `Email already exists: ${userData.email}`,
      );
      throw new AppError("User with this email already exists", 409);
    }

    const newUser = new User(userDataWithoutConfirm);
    await newUser.save();

    logger.userCreated(newUser.email, newUser._id);

    // Return user without password
    const { password, ...userWithoutPassword } = newUser.toObject();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      newUser._id.toString(),
      newUser.email,
      newUser.role,
    );

    logger.tokenGenerated(newUser.email);

    return {
      success: true,
      message: "User created successfully",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      statusCode: 201,
    };
  }

  // ============= GET ALL USERS =============
  async getAllUsers(req) {
    const { page = 1, limit = 10, role, status } = req.query;

    const skip = (page - 1) * limit;
    const query = { isDeleted: false };

    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return {
      success: true,
      message: "Users retrieved successfully",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      statusCode: 200,
    };
  }

  // ============= GET SINGLE USER =============
  async getUserById(req) {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
      statusCode: 200,
    };
  }

  // ============= GET CURRENT USER PROFILE =============
  async getUserProfile(req) {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    return {
      success: true,
      message: "User profile retrieved successfully",
      data: user,
      statusCode: 200,
    };
  }

  // ============= UPDATE USER (Full Update) =============
  async updateUser(req) {
    const { id } = req.params;
    const updateData = req.validatedBody;
    const { confirmPassword, ...updateDataWithoutConfirm } = updateData;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      logger.userNotFound(id);
      throw new AppError("User not found", 404);
    }

    // Check if email is being changed and if it's unique
    if (
      updateDataWithoutConfirm.email &&
      updateDataWithoutConfirm.email !== user.email
    ) {
      const existingUser = await User.findOne({
        email: updateDataWithoutConfirm.email,
      });
      if (existingUser) {
        logger.error(
          "User update failed",
          `Email already exists: ${updateDataWithoutConfirm.email}`,
        );
        throw new AppError("Email already exists", 409);
      }
    }

    Object.assign(user, updateDataWithoutConfirm);
    await user.save();

    logger.userUpdated(user.email, user._id);

    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: "User updated successfully",
      data: userWithoutPassword,
      statusCode: 200,
    };
  }

  // ============= UPDATE USER PROFILE (Strict) =============
  async updateUserProfile(req) {
    const { id } = req.params;
    const updateData = req.validatedBody;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    Object.assign(user, updateData);
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: "User profile updated successfully",
      data: userWithoutPassword,
      statusCode: 200,
    };
  }

  // ============= UPDATE OWN PROFILE (User Updates Their Own Profile) =============
  async updateOwnProfile(req) {
    const userId = req.user.userId;
    const { confirmPassword, ...updateData } = req.validatedBody;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    // Check if email is being changed and if it's unique
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        throw new AppError("Email already exists", 409);
      }
    }

    Object.assign(user, updateData);
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: "Your profile updated successfully",
      data: userWithoutPassword,
      statusCode: 200,
    };
  }

  // ============= UPDATE USER ROLE AND STATUS (Admin Only) =============
  async updateUserRoleAndStatus(req) {
    const { id } = req.params;
    const updateData = req.validatedBody;

    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      throw new AppError("User not found", 404);
    }

    if (updateData.role) {
      user.role = updateData.role;
    }
    if (updateData.status) {
      user.status = updateData.status;
    }

    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: "User role and status updated successfully",
      data: userWithoutPassword,
      statusCode: 200,
    };
  }

  // ============= DELETE USER (Hard Delete) =============
  async deleteUser(req) {
    const { userId } = req.validatedBody;

    const user = await User.findById(userId);
    if (!user) {
      logger.userNotFound(userId);
      throw new AppError("User not found", 404);
    }

    await User.findByIdAndDelete(userId);

    logger.userDeleted(user.email, user._id);

    return {
      success: true,
      message: "User deleted successfully",
      data: null,
      statusCode: 200,
    };
  }

  // ============= DELETE USER WITH PASSWORD (Secure Delete) =============
  async deleteUserWithPassword(req) {
    const { userId, password } = req.validatedBody;

    const user = await User.findById(userId);
    if (!user) {
      logger.userNotFound(userId);
      throw new AppError("User not found", 404);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.authFailed(user.email, "invalid password for account deletion");
      throw new AppError("Invalid password", 401);
    }

    await User.findByIdAndDelete(userId);

    logger.userDeleted(user.email, user._id);

    return {
      success: true,
      message: "User account deleted successfully",
      data: null,
      statusCode: 200,
    };
  }

  // ============= SOFT DELETE USER =============
  async softDeleteUser(req) {
    const { userId, reason, archiveData } = req.validatedBody;

    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      logger.userNotFound(userId);
      throw new AppError("User not found", 404);
    }

    user.isDeleted = true;
    user.deletedAt = new Date();
    if (reason) {
      user.deletionReason = reason;
    }

    await user.save();

    logger.userDeleted(user.email, user._id);

    return {
      success: true,
      message: "User account deactivated successfully",
      data: {
        userId: user._id,
        isDeleted: user.isDeleted,
        deletedAt: user.deletedAt,
        canRecover: archiveData,
      },
      statusCode: 200,
    };
  }

  // ============= RESTORE SOFT DELETED USER =============
  async restoreUser(req) {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isDeleted) {
      throw new AppError("User is not deleted", 400);
    }

    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();

    const { password, ...userWithoutPassword } = user.toObject();
    return {
      success: true,
      message: "User restored successfully",
      data: userWithoutPassword,
      statusCode: 200,
    };
  }

  // ============= BULK DELETE USERS =============
  async bulkDeleteUsers(req) {
    const { userIds } = req.validatedBody;

    // Check if all users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      throw new AppError("Some users not found", 404);
    }

    await User.deleteMany({ _id: { $in: userIds } });

    return {
      success: true,
      message: `${userIds.length} users deleted successfully`,
      data: {
        deletedCount: userIds.length,
        userIds,
      },
      statusCode: 200,
    };
  }

  // ============= GET USER STATISTICS =============
  async getUserStatistics(req) {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeUsers = await User.countDocuments({
      isDeleted: false,
      status: "active",
    });
    const inactiveUsers = await User.countDocuments({
      isDeleted: false,
      status: "inactive",
    });

    const usersByRole = await User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    return {
      success: true,
      message: "User statistics retrieved successfully",
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
      statusCode: 200,
    };
  }

  // ============= SEARCH USERS =============
  async searchUsers(req) {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      throw new AppError("Search query is required", 400);
    }

    const skip = (page - 1) * limit;

    const searchQuery = {
      isDeleted: false,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    };

    const users = await User.find(searchQuery)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    return {
      success: true,
      message: "Users search results",
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
      statusCode: 200,
    };
  }

  // ============= LOGIN USER =============
  async loginUser(loginData) {
    const { email, password } = loginData;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user || user.isDeleted) {
      logger.authFailed(email, "user not found or deleted");
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.authFailed(email, "invalid password");
      throw new AppError("Invalid email or password", 401);
    }

    logger.authSuccess(user.email, "logged in");

    // Return user without password
    const { password: pwd, ...userWithoutPassword } = user.toObject();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role,
    );

    logger.tokenGenerated(user.email);

    return {
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      statusCode: 200,
    };
  }

  // ============= REFRESH ACCESS TOKEN =============
  async refreshTokens(req) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warning("Token refresh failed", "no refresh token provided");
      throw new AppError("Refresh token is required", 400);
    }

    try {
      const newAccessToken = refreshAccessToken(refreshToken);
      logger.tokenRefreshed("user");
      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
        statusCode: 200,
      };
    } catch (err) {
      logger.error("Token refresh failed", "invalid or expired refresh token");
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }
}

export default new UserService();
