import pool from "../config/db.js";

/**
 * Create new book
 * - Inserts a new book record into the "books" table
 * - Returns the created book row
 *
 * @param {object} bookData - Book details
 * @returns {object} Newly created book record
 */
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

/**
 * Get list of books with search, pagination, and favorite status
 * - Supports search by title or author
 * - Supports pagination (page, limit)
 * - Supports sorting (created_at, title)
 * - Adds "is_favorite" field if userId is provided
 *
 * @param {object} params - Search and pagination parameters
 * @returns {object} Paginated list of books with metadata
 */
export async function getBooks({
  search = "",
  page = 0,
  limit = 10,
  sortBy = "created_at",
  sortOrder = "DESC",
  userId // Used to check if each book is in user's favorites
}) {
  const offset = page * limit;
  const keyword = `%${search}%`;

  // Validate sortBy field (only allow created_at or title)
  const allowedSortFields = ["created_at", "title"];
  if (!allowedSortFields.includes(sortBy)) {
    sortBy = "created_at";
  }

  // Validate sortOrder (only allow ASC or DESC)
  const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

  // Query books and check if they are in user's favorites
  const booksResult = await pool.query(
    `SELECT b.*, 
            CASE WHEN uf.book_id IS NOT NULL THEN true ELSE false END AS is_favorite
     FROM books b
     LEFT JOIN user_favorites uf 
       ON b.id = uf.book_id AND uf.user_id = $4
     WHERE b.title ILIKE $1 OR b.author ILIKE $1
     ORDER BY ${sortBy} ${order}
     LIMIT $2 OFFSET $3`,
    [keyword, limit, offset, userId]
  );

  // Query total count for pagination metadata
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM books
     WHERE title ILIKE $1 OR author ILIKE $1`,
    [keyword]
  );

  const totalElements = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalElements / limit);

  return {
    books: booksResult.rows,
    totalElements,
    pageNum: page,
    pageSize: limit,
    totalPages,
    hasNextPage: page < totalPages - 1,
    hasPrevPage: page > 0
  };
}

/**
 * Get book by ID with favorite status
 * - Fetches a single book by its ID
 * - Adds "is_favorite" field if userId is provided
 *
 * @param {object} params - Book ID and optional userId
 * @returns {object|null} Book record or null if not found
 */
export async function getBookById({ bookId, userId }) {
  const result = await pool.query(
    `SELECT b.*,
            CASE WHEN uf.book_id IS NOT NULL THEN true ELSE false END AS is_favorite
     FROM books b
     LEFT JOIN user_favorites uf
       ON b.id = uf.book_id AND uf.user_id = $2
     WHERE b.id = $1 
     LIMIT 1`,
    [bookId, userId]
  );
  return result.rows[0] || null;
}

/**
 * Delete book by ID
 * - Removes a book record from the "books" table
 *
 * @param {string} id - Book ID
 * @returns {number} Number of rows deleted (0 if not found)
 */
export async function deleteBookById(id) {
  const result = await pool.query(`DELETE FROM books WHERE id = $1`, [id]);
  return result.rowCount; // Returns number of rows deleted
}

/**
 * Find book by file URL
 * - Checks if a book already exists with the given file URL
 * - Prevents duplicate uploads
 *
 * @param {string} fileUrl - File URL of the book
 * @returns {object|null} Book record if found, otherwise null
 */
export async function findBookByFileUrl(fileUrl) {
  const result = await pool.query(
    `SELECT * FROM books WHERE file_url = $1 LIMIT 1`,
    [fileUrl]
  );
  return result.rows[0];
}
