import {
  createBookService,
  deleteBookByIdService,
  getBookByIdService,
  listBooksService
} from "../services/bookService.js";

/**
 * Controller: Create new book
 * - Reads body from client, calls service to create a book
 * - 201 on success, 400 on business failure, 500 on server error
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function createBookController(req, res) {
  try {
    const result = await createBookService(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: List books with search/pagination/sort (and favorite flag)
 * - Parses query params and forwards userId if available
 * - Always returns 200 with normalized data on success
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function listBooksController(req, res) {
  try {
    const search = req.query.search || "";
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const sortBy = req.query.sortBy || "";
    const sortOrder = req.query.sortOrder || "";

    const result = await listBooksService({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      userId: req.user ? req.user.id : null
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in listBooksController:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Get book by ID
 * - Returns 404 when not found, 200 with book data otherwise
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function getBookByIdController(req, res) {
  try {
    const bookId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const result = await getBookByIdService(bookId, userId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Controller: Delete book by ID
 * - Returns 404 if no rows deleted, 200 on success
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
export async function deleteBookByIdController(req, res) {
  try {
    const result = await deleteBookByIdService(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
