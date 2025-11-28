import {
  createBook,
  deleteBookById,
  getBookById,
  getBooks,
  getBooksByCategory,
  getPopularCategories
} from "../models/bookModel.js";
import ApiError from "../utils/ApiError.js";

/**
 * Service: Create new book
 * - Calls the model to create a book
 * - Normalizes the response for controller/frontend
 *
 * @param {object} data - Book details
 * @param {string} data.title - Title of the book
 * @param {string} data.author - Author name
 * @param {string} [data.description] - Description
 * @param {string} data.fileUrl - File URL
 * @param {string} [data.coverUrl] - Cover image URL
 * @param {string[]} [data.tags] - Tags list
 * @param {boolean} [data.isPremium=false] - Premium flag
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export async function createBookService(data) {
  const book = await createBook(data);
  if (!book) throw new ApiError("Failed to create new book", 400);
  return book;
}

/**
 * Service: List books with search/pagination/sort and favorite flag
 * - Calls the model to fetch books with pagination metadata
 * - Returns data as-is within a normalized envelope
 *
 * @param {object} params - Query parameters
 * @param {string} [params.search=""] - Keyword for title/author
 * @param {number} [params.page=0] - Zero-based page index
 * @param {number} [params.limit=10] - Page size
 * @param {string} [params.sortBy="created_at"] - Sort field (created_at|title)
 * @param {string} [params.sortOrder="DESC"] - Sort order (ASC|DESC)
 * @param {string|null} [params.userId] - For favorite flag
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export async function listBooksService(params) {
  return await getBooks(params);
}

/**
 * Service: Get book by ID (with optional favorite flag)
 * - Returns a normalized not-found error if missing
 *
 * @param {string} id - Book ID
 * @param {string|null} userId - User ID to compute is_favorite
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export async function getBookByIdService(bookId, userId) {
  const book = await getBookById({ bookId, userId });
  if (!book) throw new ApiError("Book not found", 404);
  return book;
}

/**
 * Service: Delete book by ID
 * - Returns deletedCount when deletion succeeds
 *
 * @param {string} id - Book ID
 * @returns {{success: boolean, data?: {deletedCount: number}, error?: string}}
 */
export async function deleteBookByIdService(id) {
  const deletedCount = await deleteBookById(id);
  if (deletedCount === 0) throw new ApiError("Book not found", 404);
  return { deletedCount };
}

/**
 * Service: Get popular categories
 * - Calls the model to fetch top N categories (tags) with count
 * - Normalizes the response for controller/frontend
 *
 * @param {number} [limit=10] - Number of categories to return
 * @returns {{success: boolean, data?: object[], error?: string}}
 */
export async function getPopularCategoriesService(limit = 10) {
  const categories = await getPopularCategories(limit);
  if (!categories || categories.length === 0) {
    throw new ApiError("No categories found", 404);
  }
  return categories;
}

/**
 * Service: Get books by category
 * - Calls the model to fetch books filtered by category/tag
 * - Supports search, pagination, and sorting
 *
 * @param {object} params - Query parameters
 * @param {string} params.category - Category/tag to filter
 * @param {string} [params.search=""] - Keyword for title/author
 * @param {number} [params.page=0] - Zero-based page index
 * @param {number} [params.limit=10] - Page size
 * @param {string} [params.sortOrder="ASC"] - Sort order (ASC|DESC)
 * @param {string|null} [params.userId] - For favorite flag
 * @returns {{success: boolean, data?: object, error?: string}}
 */
export async function getBooksByCategoryService(params) {
  if (!params.category) {
    throw new ApiError("Category is required", 400);
  }

  const books = await getBooksByCategory(params);
  if (!books || books.totalElements === 0) {
    throw new ApiError("No books found for this category", 404);
  }

  return books;
}
