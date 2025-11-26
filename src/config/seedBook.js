// seedBooks.js
import axios from "axios";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";

/**
 * Fetch recent books from dBooks API
 * - Calls https://www.dbooks.org/api/recent
 * - Returns an array of book metadata
 */
async function fetchRecentBooks() {
  const res = await axios.get("https://www.dbooks.org/api/recent");
  return res.data.books;
}

/**
 * Fetch detailed book info by ID
 * - Calls https://www.dbooks.org/api/book/:id
 * - Returns detailed book data
 */
async function fetchBookDetail(bookId) {
  const res = await axios.get(`https://www.dbooks.org/api/book/${bookId}`);
  return res.data;
}

/**
 * Map dBooks API response to local Book model
 * - Normalizes fields to match our database schema
 * - Randomly marks ~30% of books as premium (for testing/demo purposes)
 */
function mapToBookModel(book) {
  return {
    title: book.title,
    author: book.authors,
    description: book.description || "No description available.",
    fileUrl: book.url,
    coverUrl: book.image,
    tags: [],
    isPremium: Math.random() < 0.3 // Randomly mark 30% of books as premium
  };
}

/**
 * Seed books from dBooks API into local database
 * - Fetches recent books
 * - For each book:
 *   → Fetch detailed info
 *   → Map to local model
 *   → Check for duplicates by fileUrl
 *   → Insert into DB if not exists
 * - Logs summary of added, skipped, and error counts
 */
export async function seedBooksFromDBooks() {
  try {
    const recentBooks = await fetchRecentBooks();

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const book of recentBooks) {
      try {
        const detail = await fetchBookDetail(book.id);
        const mapped = mapToBookModel(detail);

        // Check for duplicates before inserting
        const exists = await findBookByFileUrl(mapped.fileUrl);
        if (exists) {
          console.log(`⚠️ Skipped (already exists): ${mapped.title}`);
          skippedCount++;
          continue;
        }

        const saved = await createBook(mapped);
        console.log(`✅ Seeded: ${saved.title}`);
        addedCount++;
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.log(`❌ Skipped (404 Not Found): Book ID ${book.id}`);
        } else {
          console.error(`❌ Error seeding book ID ${book.id}:`, err.message);
        }
        errorCount++;
      }
    }

    console.log(`🎉 Finished seeding books from dBooks!`);
    console.log(
      `📊 Summary: ${addedCount} added, ${skippedCount} skipped, ${errorCount} errors.`
    );
  } catch (error) {
    console.error("❌ Error while seeding books:", error.message);
  }
}
