import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./src/user/schema/user.schema.js";
import Transaction from "./src/transaction/schema/transaction.schema.js";
import logger from "./src/common/logger.js";

dotenv.config();

// Sample transaction data
const sampleTransactions = [
  // Income transactions
  {
    amount: 5000,
    type: "income",
    category: "salary",
    description: "Monthly salary",
    tags: ["work", "monthly"],
  },
  {
    amount: 2500,
    type: "income",
    category: "freelance",
    description: "Freelance project - Web Development",
    tags: ["freelance", "coding"],
  },
  {
    amount: 1500,
    type: "income",
    category: "bonus",
    description: "Performance bonus",
    tags: ["bonus", "award"],
  },
  {
    amount: 800,
    type: "income",
    category: "investment",
    description: "Dividend from mutual funds",
    tags: ["investment", "dividend"],
  },
  {
    amount: 200,
    type: "income",
    category: "gift",
    description: "Birthday gift from parents",
    tags: ["gift", "personal"],
  },

  // Expense - Food
  {
    amount: 45.5,
    type: "expense",
    category: "food",
    description: "Grocery shopping at Walmart",
    tags: ["groceries", "weekly"],
  },
  {
    amount: 28,
    type: "expense",
    category: "food",
    description: "Lunch at office cafe",
    tags: ["dining", "work"],
  },
  {
    amount: 65,
    type: "expense",
    category: "food",
    description: "Dinner at restaurant with friends",
    tags: ["dining", "social"],
  },
  {
    amount: 15,
    type: "expense",
    category: "food",
    description: "Coffee and snacks",
    tags: ["casual"],
  },
  {
    amount: 120,
    type: "expense",
    category: "food",
    description: "Monthly grocery delivery",
    tags: ["groceries", "bulk"],
  },

  // Expense - Transport
  {
    amount: 50,
    type: "expense",
    category: "transport",
    description: "Uber ride to office",
    tags: ["commute"],
  },
  {
    amount: 50,
    type: "expense",
    category: "transport",
    description: "Fuel for car",
    tags: ["fuel", "gas"],
  },
  {
    amount: 100,
    type: "expense",
    category: "transport",
    description: "Monthly metro pass",
    tags: ["public-transport"],
  },
  {
    amount: 75,
    type: "expense",
    category: "transport",
    description: "Taxi to airport",
    tags: ["travel", "airport"],
  },
  {
    amount: 200,
    type: "expense",
    category: "transport",
    description: "Car maintenance and oil change",
    tags: ["vehicle-maintenance"],
  },

  // Expense - Utilities
  {
    amount: 120,
    type: "expense",
    category: "utilities",
    description: "Electricity bill",
    tags: ["monthly", "bills"],
  },
  {
    amount: 45,
    type: "expense",
    category: "utilities",
    description: "Internet bill",
    tags: ["internet", "monthly"],
  },
  {
    amount: 80,
    type: "expense",
    category: "utilities",
    description: "Water bill",
    tags: ["water", "monthly"],
  },
  {
    amount: 30,
    type: "expense",
    category: "utilities",
    description: "Gas bill",
    tags: ["gas", "monthly"],
  },

  // Expense - Entertainment
  {
    amount: 15,
    type: "expense",
    category: "entertainment",
    description: "Movie tickets",
    tags: ["movies", "entertainment"],
  },
  {
    amount: 12.99,
    type: "expense",
    category: "entertainment",
    description: "Netflix subscription",
    tags: ["streaming", "subscription"],
  },
  {
    amount: 50,
    type: "expense",
    category: "entertainment",
    description: "Concert tickets",
    tags: ["music", "live-event"],
  },
  {
    amount: 25,
    type: "expense",
    category: "entertainment",
    description: "Video game purchase",
    tags: ["gaming"],
  },
  {
    amount: 9.99,
    type: "expense",
    category: "entertainment",
    description: "Spotify premium",
    tags: ["music", "streaming"],
  },

  // Expense - Healthcare
  {
    amount: 80,
    type: "expense",
    category: "healthcare",
    description: "Doctor appointment",
    tags: ["medical", "health"],
  },
  {
    amount: 45,
    type: "expense",
    category: "healthcare",
    description: "Pharmacy medicines",
    tags: ["medications"],
  },
  {
    amount: 150,
    type: "expense",
    category: "healthcare",
    description: "Dental checkup and cleaning",
    tags: ["dental", "health"],
  },
  {
    amount: 30,
    type: "expense",
    category: "healthcare",
    description: "Gym membership",
    tags: ["fitness"],
  },

  // Expense - Education
  {
    amount: 500,
    type: "expense",
    category: "education",
    description: "Online course - React JS",
    tags: ["learning", "course"],
  },
  {
    amount: 25,
    type: "expense",
    category: "education",
    description: "Books for study",
    tags: ["books"],
  },
  {
    amount: 100,
    type: "expense",
    category: "education",
    description: "Certification exam fee",
    tags: ["certification"],
  },

  // Expense - Shopping
  {
    amount: 150,
    type: "expense",
    category: "shopping",
    description: "Clothes shopping",
    tags: ["fashion", "clothing"],
  },
  {
    amount: 80,
    type: "expense",
    category: "shopping",
    description: "Electronics - Phone charger",
    tags: ["electronics"],
  },
  {
    amount: 200,
    type: "expense",
    category: "shopping",
    description: "Laptop accessories",
    tags: ["electronics", "work"],
  },
  {
    amount: 60,
    type: "expense",
    category: "shopping",
    description: "Home decor items",
    tags: ["home"],
  },

  // Expense - Rent
  {
    amount: 1200,
    type: "expense",
    category: "rent",
    description: "Monthly rent",
    tags: ["housing", "monthly"],
  },

  // Expense - Insurance
  {
    amount: 250,
    type: "expense",
    category: "insurance",
    description: "Car insurance",
    tags: ["auto-insurance", "monthly"],
  },
  {
    amount: 100,
    type: "expense",
    category: "insurance",
    description: "Health insurance premium",
    tags: ["health-insurance"],
  },

  // Expense - Subscriptions
  {
    amount: 14.99,
    type: "expense",
    category: "subscriptions",
    description: "Adobe Creative Cloud",
    tags: ["software", "subscription"],
  },
  {
    amount: 19.99,
    type: "expense",
    category: "subscriptions",
    description: "Microsoft Office 365",
    tags: ["software", "subscription"],
  },
  {
    amount: 5,
    type: "expense",
    category: "subscriptions",
    description: "Cloud storage - Dropbox",
    tags: ["storage", "subscription"],
  },

  // Expense - Other
  {
    amount: 35,
    type: "expense",
    category: "other_expense",
    description: "Birthday gift for friend",
    tags: ["gift", "other"],
  },
  {
    amount: 50,
    type: "expense",
    category: "other_expense",
    description: "Donation to charity",
    tags: ["charity", "donation"],
  },
  {
    amount: 20,
    type: "expense",
    category: "other_expense",
    description: "Miscellaneous expenses",
    tags: ["other"],
  },

  // Additional Income
  {
    amount: 500,
    type: "income",
    category: "other_income",
    description: "Cashback rewards",
    tags: ["rewards", "cashback"],
  },
  {
    amount: 1000,
    type: "income",
    category: "freelance",
    description: "Additional freelance work",
    tags: ["freelance"],
  },
];

async function seedTransactions() {
  try {
    logger.projectStart(process.env.PORT || 8000, "seeding");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    logger.dbConnected("MongoDB");

    // Get first admin user or create one
    let admin = await User.findOne({ role: "admin" });

    if (!admin) {
      logger.warning("No admin user found", "Creating default admin user");
      admin = await User.create({
        name: "Admin User",
        email: "admin@findash.com",
        password: "AdminPass123!@#",
        role: "admin",
        status: "active",
      });
      logger.userCreated(admin.email, admin._id);
    } else {
      logger.success(`Found admin user: ${admin.email}`);
    }

    // Clear existing transactions for this user
    const deletedCount = await Transaction.deleteMany({ userId: admin._id });
    logger.info(
      "Cleared existing transactions",
      `Deleted ${deletedCount.deletedCount} transactions`,
    );

    // Generate transactions with varied dates
    const transactions = sampleTransactions.map((transaction, index) => {
      // Spread transactions across last 90 days
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60),
        0,
        0,
      );

      return {
        ...transaction,
        userId: admin._id,
        date,
      };
    });

    // Insert all transactions
    const insertedTransactions = await Transaction.insertMany(transactions);
    logger.success(
      `${insertedTransactions.length} transactions created successfully`,
      `Admin: ${admin.email}`,
    );

    // Get statistics
    const stats = await Transaction.aggregate([
      {
        $match: { userId: admin._id, isDeleted: false },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    logger.info("Transaction Statistics:", "");
    stats.forEach((stat) => {
      console.log(
        `  ${stat._id.toUpperCase()}: ${stat.count} transactions, Total: $${stat.total.toFixed(2)}`,
      );
    });

    logger.success("Database seeding completed successfully!");

    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Total Transactions Created: 50`);
    console.log(`👤 User Email: ${admin.email}`);
    console.log(`🆔 User ID: ${admin._id}`);
    console.log("\n📝 Next Steps:");
    console.log(`1. Login in Postman with: ${admin.email}`);
    console.log(`2. Copy the accessToken to environment`);
    console.log(`3. Test all transaction endpoints`);
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    logger.error("Database seeding failed", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedTransactions();
