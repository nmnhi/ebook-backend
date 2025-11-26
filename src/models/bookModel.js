import pool from "../config/db.js";

// Create new book
export async function createBook({
  title,
  author,
  description,
  fileUrl,
  coverUrl,
  tags = [],
  isPremium = false
}) {
  const result = await pool.query(
    `INSERT INTO books (title, author, description, file_url, cover_url, tags, is_premium)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [title, author, description, fileUrl, coverUrl, tags, isPremium]
  );
  return result.rows[0];
}

// Get list books with search and pagination
export async function getBooks({
  search = "",
  page = 0,
  limit = 10,
  sortBy = "created_at",
  sortOrder = "DESC"
}) {
  const offset = page * limit;
  const keyword = `%${search}%`;

  // Validate sortBy to prevent SQL injection
  const allowedSortFields = ["created_at", "title"];
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "created_at";
  }

  // Validate sortOrder
  const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Query for books
  const booksResult = await pool.query(
    `SELECT * FROM books
     WHERE title ILIKE $1 OR author ILIKE $1
     ORDER BY ${sortBy} ${order}
     LIMIT $2 OFFSET $3`,
    [keyword, limit, offset]
  );

  // Query for total count
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM books
     WHERE title ILIKE $1 OR author ILIKE $1`,
    [keyword]
  );

  const totalElements = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalElements / limit);

  return {
    books: booksResult.rows,
    totalElements: totalElements,
    totalPages,
    pageNum: page,
    pageSize: limit,
    hasNextPage:
      page < Math.ceil(parseInt(countResult.rows[0].count, 10) / limit) - 1,
    hasPrevPage: page > 0
  };
}

// Get book by ID
export async function getBookById(id) {
  const result = await pool.query(`SELECT * FROM books WHERE id = $1`, [id]);
  return result.rows[0];
}

// Delete book by ID
export async function deleteBookById(id) {
  const result = await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
  return result.rowCount;
}

// Check if book exists by file URL
export async function findBookByFileUrl(fileUrl) {
  const result = await pool.query(`SELECT * FROM books WHERE file_url = $1`, [
    fileUrl
  ]);
  return result.rows[0];
}
