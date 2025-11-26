import {
  createBook,
  deleteBookById,
  getBookById,
  getBooks
} from "../models/bookModel.js";

// Create new book
export async function createBookService(data) {
  return await createBook(data);
}

// Get list books with search and pagination
export async function listBooksService(params) {
  return await getBooks(params);
}

// Get book by ID
export async function getBookByIdService(id) {
  return await getBookById(id);
}

// Delete book by ID
export async function deleteBookByIdService(id) {
  return await deleteBookById(id);
}
