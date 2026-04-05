import chalk from "chalk";

const logger = {
  // ============= PROJECT EVENTS =============
  projectStart: (port, env = "development") => {
    console.log("\n");
    console.log(
      chalk.bgGreen.black.bold(" 🚀 PROJECT STARTED ") +
        chalk.green(` on port ${port} [${env}]`),
    );
    console.log(chalk.green("═".repeat(60)));
    console.log("");
  },

  projectStop: () => {
    console.log("\n");
    console.log(chalk.bgRed.white.bold(" ⛔ PROJECT SHUTTING DOWN "));
    console.log(chalk.red("═".repeat(60)));
    console.log("");
  },

  // ============= DATABASE EVENTS =============
  dbConnected: (host = "MongoDB") => {
    console.log(chalk.bgBlue.white.bold(" 🗄️  DATABASE CONNECTED "));
    console.log(chalk.blue(`   ✓ ${host} connected successfully`));
    console.log("");
  },

  dbConnectionFailed: (error) => {
    console.log(chalk.bgRed.white.bold(" ❌ DATABASE CONNECTION FAILED "));
    console.log(chalk.red(`   ✗ Error: ${error}`));
    console.log("");
  },

  dbDisconnected: () => {
    console.log(chalk.bgYellow.black.bold(" 🔌 DATABASE DISCONNECTED "));
    console.log("");
  },

  // ============= HTTP REQUEST/RESPONSE =============
  incomingRequest: (method, path, ip) => {
    const methodColor = {
      GET: chalk.cyan,
      POST: chalk.green,
      PUT: chalk.yellow,
      DELETE: chalk.red,
      PATCH: chalk.magenta,
    };
    const colorFunc = methodColor[method] || chalk.white;
    console.log(chalk.dim.grey("─".repeat(60)));
    console.log(
      `📨 ${colorFunc.bold(method)} ${chalk.blue(path)} ${chalk.dim(`[${ip}]`)}`,
    );
  },

  requestSuccess: (method, path, statusCode, duration) => {
    const statusColor =
      statusCode >= 200 && statusCode < 300 ? chalk.green : chalk.yellow;
    console.log(
      `✅ ${chalk.green("Success")} - ${statusColor(`${statusCode}`)} ${chalk.dim(`(${duration}ms)`)} ${path}`,
    );
    console.log(chalk.dim.grey("─".repeat(60)));
    console.log("");
  },

  requestError: (method, path, statusCode, duration, message) => {
    const statusColor = statusCode >= 400 ? chalk.red : chalk.yellow;
    console.log(
      `❌ ${chalk.red("Error")} - ${statusColor(`${statusCode}`)} ${chalk.dim(`(${duration}ms)`)} ${path}`,
    );
    console.log(`   ${chalk.red(`→ ${message}`)}`);
    console.log(chalk.dim.grey("─".repeat(60)));
    console.log("");
  },

  // ============= AUTHENTICATION =============
  authSuccess: (email, action = "logged in") => {
    console.log(chalk.bgGreen.black.bold(" 🔐 AUTH SUCCESS "));
    console.log(chalk.green(`   ✓ ${email} ${action}`));
    console.log("");
  },

  authFailed: (email, reason) => {
    console.log(chalk.bgRed.white.bold(" 🔓 AUTH FAILED "));
    console.log(chalk.red(`   ✗ ${email}: ${reason}`));
    console.log("");
  },

  tokenGenerated: (email) => {
    console.log(chalk.bgCyan.black.bold(" 🎫 TOKEN GENERATED "));
    console.log(chalk.cyan(`   ✓ Tokens generated for ${email}`));
    console.log("");
  },

  tokenRefreshed: (email) => {
    console.log(chalk.bgCyan.black.bold(" 🔄 TOKEN REFRESHED "));
    console.log(chalk.cyan(`   ✓ Access token refreshed for ${email}`));
    console.log("");
  },

  // ============= USER OPERATIONS =============
  userCreated: (email, id) => {
    console.log(chalk.bgGreen.black.bold(" 👤 USER CREATED "));
    console.log(chalk.green(`   ✓ ${email} (ID: ${id})`));
    console.log("");
  },

  userUpdated: (email, id) => {
    console.log(chalk.bgBlue.white.bold(" 📝 USER UPDATED "));
    console.log(chalk.blue(`   ✓ ${email} (ID: ${id})`));
    console.log("");
  },

  userDeleted: (email, id) => {
    console.log(chalk.bgYellow.black.bold(" 🗑️  USER DELETED "));
    console.log(chalk.yellow(`   ✓ ${email} (ID: ${id})`));
    console.log("");
  },

  userNotFound: (email) => {
    console.log(chalk.bgRed.white.bold(" ❌ USER NOT FOUND "));
    console.log(chalk.red(`   ✗ ${email}`));
    console.log("");
  },

  // ============= GENERAL OPERATIONS =============
  success: (message, details = "") => {
    console.log(chalk.bgGreen.black.bold(" ✓ SUCCESS "));
    console.log(chalk.green(`   ${message}`));
    if (details) console.log(chalk.dim(`   ${details}`));
    console.log("");
  },

  error: (message, details = "") => {
    console.log(chalk.bgRed.white.bold(" ✗ ERROR "));
    console.log(chalk.red(`   ${message}`));
    if (details) console.log(chalk.dim(`   ${details}`));
    console.log("");
  },

  warning: (message, details = "") => {
    console.log(chalk.bgYellow.black.bold(" ⚠️  WARNING "));
    console.log(chalk.yellow(`   ${message}`));
    if (details) console.log(chalk.dim(`   ${details}`));
    console.log("");
  },

  info: (message, details = "") => {
    console.log(chalk.bgCyan.black.bold(" ℹ️  INFO "));
    console.log(chalk.cyan(`   ${message}`));
    if (details) console.log(chalk.dim(`   ${details}`));
    console.log("");
  },

  debug: (message, details = "") => {
    if (process.env.DEBUG === "true") {
      console.log(chalk.bgMagenta.white.bold(" 🐛 DEBUG "));
      console.log(chalk.magenta(`   ${message}`));
      if (details) console.log(chalk.dim(`   ${details}`));
      console.log("");
    }
  },
};

export default logger;
