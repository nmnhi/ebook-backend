import {
  createBookService,
  deleteBookByIdService,
  getBookByIdService,
  listBooksService
} from "../services/bookService.js";

// Controller create new book
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

// Controller get list books with search and pagination
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
      sortOrder
    });

    res.status(200).json({
      success: true,
      books: result.books,
      totalElements: result.totalElements,
      pageNum: result.pageNum,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.totalElements / result.pageSize),
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
  } catch (error) {
    console.error("Error in listBooksController:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
}

// Controller get book by ID
export async function getBookByIdController(req, res) {
  try {
    const book = await getBookByIdService(req.params.id);
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

// Controller delete book by ID
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
