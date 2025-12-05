import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import { seedBooksFromDBooks } from "./config/seedBook.js";

dotenv.config();
// Load environment variables from .env file

const PORT = process.env.PORT || 8080;

/**
 * Start server
 * - Tests PostgreSQL connection before starting
 * - Optionally seeds books into database
 * - Starts Express server on given PORT
 * - Schedules book seeding every 2 hours
 */
async function startServer() {
  try {
    // Test database connection first
    await pool.query("SELECT NOW()");
    console.log("✅ POSTGRESQL CONNECTED SUCCESSFULLY!");

    // Run seed immediately when server starts (currently commented out)
    // await seedBooksFromDBooks();
    // await seedBooksFromOpenLibrary();
    // await seedBooksFromGutenberg();

    // Start server only if database connection is successful
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // Schedule seed every 2 hours
    setInterval(() => {
      console.log("⏰ Running seedBooks again...");
      seedBooksFromDBooks();
      // seedBooksFromOpenLibrary();
      // seedBooksFromGutenberg();
    }, 2 * 60 * 60 * 1000);
  } catch (err) {
    // If DB connection fails, log error and stop server
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1);
  }
}

startServer();
