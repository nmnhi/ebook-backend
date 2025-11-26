import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";
import { seedBooksFromDBooks } from "./config/seedBook.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

async function startServer() {
  try {
    // Test database connection first
    await pool.query("SELECT NOW()");
    console.log("✅ POSTGRESQL CONNECTED SUCCESSFULLY!");

    // Run seed immediately when server starts
    // await seedBooksFromDBooks();

    // Start server only if database connection is successful
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

    // Schedule seed every 2 hours
    setInterval(() => {
      console.log("⏰ Running seedBooks again...");
      seedBooksFromDBooks();
    }, 2 * 60 * 60 * 1000);
  } catch (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err.message);
    process.exit(1); // Stop server completely if database connection fails
  }
}

startServer();
