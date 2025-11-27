import {
  createBookService,
  deleteBookByIdService,
  getBookByIdService,
  listBooksService
} from "../services/bookService.js";

/**
 * Controller: Create new book
 */
export async function createBookController(req, res, next) {
  try {
    const book = await createBookService(req.body);
    res.success(201, book);
  } catch (error) {
    next(error); // để errorHandler xử lý
  }
}

/**
 * Controller: List books with search/pagination/sort (and favorite flag)
 */
export async function listBooksController(req, res, next) {
  try {
    const search = req.query.search || "";
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const sortBy = req.query.sortBy || "";
    const sortOrder = req.query.sortOrder || "";

    const books = await listBooksService({
      search,
      page,
      limit,
      sortBy,
      sortOrder,
      userId: req.user ? req.user.id : null
    });

    res.success(200, books);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Get book by ID
 */
export async function getBookByIdController(req, res, next) {
  try {
    const book = await getBookByIdService(
      req.params.id,
      req.user ? req.user.id : null
    );
    res.success(200, book);
  } catch (error) {
    next(error);
  }
}

/**
 * Controller: Delete book by ID
 */
export async function deleteBookByIdController(req, res, next) {
  try {
    const result = await deleteBookByIdService(req.params.id);
    res.success(200, result);
  } catch (error) {
    next(error);
  }
}
