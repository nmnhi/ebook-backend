import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();
// Load environment variables from .env file (e.g., DATABASE_URL)

const { Pool } = pkg;

/**
 * PostgreSQL connection pool
 * - Uses DATABASE_URL from environment variables
 * - Manages multiple client connections efficiently
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Event listener: successful connection
pool.on("connect", () => {
  console.log("POSTGRESQL CONNECTED SUCCESSFULLY!");
});

// Event listener: unexpected error on idle client
pool.on("error", (err) => {
  console.log("Unexpected error on idle client", err);
});

export default pool;
