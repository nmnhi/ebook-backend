import {
  createBook,
  deleteBookById,
  getBookById,
  getBooks
} from "../models/bookModel.js";

/**
 * Service: Create new book
 * - Calls the model function to insert a new book into the database
 * - Returns the created book record
 *
 * @param {object} data - Book details (title, author, description, etc.)
 * @returns {object} Newly created book record
 */
export async function createBookService(data) {
  return await createBook(data);
}

/**
 * Service: Get list of books with search and pagination
 * - Calls the model function to fetch books
 * - Supports search, pagination, sorting, and favorite status
 *
 * @param {object} params - Search and pagination parameters
 * @returns {object} Paginated list of books with metadata
 */
export async function listBooksService(params) {
  return await getBooks(params);
}

/**
 * Service: Get book by ID
 * - Calls the model function to fetch a single book by ID
 * - Includes favorite status if userId is provided
 *
 * @param {string} id - Book ID
 * @param {string|null} userId - User ID (optional, for favorites)
 * @returns {object|null} Book record if found, otherwise null
 */
export async function getBookByIdService(id, userId) {
  return await getBookById({ id, userId });
}

/**
 * Service: Delete book by ID
 * - Calls the model function to remove a book from the database
 * - Returns number of rows deleted (0 if not found)
 *
 * @param {string} id - Book ID
 * @returns {number} Number of rows deleted
 */
export async function deleteBookByIdService(id) {
  return await deleteBookById(id);
}
