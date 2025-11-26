import {
  createBookService,
  deleteBookByIdService,
  getBookByIdService,
  listBooksService
} from "../services/bookService.js";

/**
 * Controller: Create new book
 * - Calls service to insert a new book into the database
 * - Returns 201 with created book if successful
 * - Returns 400 if creation failed
 * - Returns 500 if an error occurs
 */
export async function createBookController(req, res) {
  try {
    const book = await createBookService(req.body);
    if (!book) {
      return res
        .status(400)
        .json({ success: false, message: "Failed to create book" });
    }
    res.status(201).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Get list of books with search and pagination
 * - Extracts query parameters (search, page, limit, sortBy, sortOrder)
 * - Passes userId if available to check favorite status
 * - Calls service to fetch books with pagination and metadata
 * - Returns 200 with books and pagination info
 * - Returns 500 if an error occurs
 */
export async function listBooksController(req, res) {
  try {
    const search = req.query.search || "";
    const page = req.query.page ? parseInt(req.query.page, 10) : 0; // default 0
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const sortBy = req.query.sortBy || "";
    const sortOrder = req.query.sortOrder || "";

    const result = await listBooksService({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      userId: req.user ? req.user.id : null // Pass userId for favorites
    });

    res.status(200).json({
      success: true,
      books: result.books, // List of books with is_favorite field
      totalElements: result.totalElements, // Total number of books
      pageNum: result.pageNum, // Current page number
      pageSize: result.pageSize, // Page size
      totalPages: Math.ceil(result.totalElements / result.pageSize), // Total pages
      hasNextPage: result.hasNextPage, // Whether there is a next page
      hasPrevPage: result.hasPrevPage // Whether there is a previous page
    });
  } catch (error) {
    console.error("Error in listBooksController:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Get book by ID
 * - Extracts book ID from request params
 * - Passes userId if available to check favorite status
 * - Calls service to fetch book details
 * - Returns 200 with book if found
 * - Returns 404 if book not found
 * - Returns 500 if an error occurs
 */
export async function getBookByIdController(req, res) {
  try {
    const id = req.params.id;
    const userId = req.user ? req.user.id : null;
    const book = await getBookByIdService(id, userId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    res.status(200).json({ success: true, book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * Controller: Delete book by ID
 * - Extracts book ID from request params
 * - Calls service to delete book
 * - Returns 200 if deletion successful
 * - Returns 404 if book not found
 * - Returns 500 if an error occurs
 */
export async function deleteBookByIdController(req, res) {
  try {
    const result = await deleteBookByIdService(req.params.id);
    if (result === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
