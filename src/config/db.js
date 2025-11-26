import dotenv from "dotenv";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
  console.log("POSTGRESQL CONNECTED SUCCESSFULLY!");
});

pool.on("error", (err) => {
  console.log("Unexpected error on idle client", err);
});

export default pool;
