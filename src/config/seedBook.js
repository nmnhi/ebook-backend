// seedBooks.js
import axios from "axios";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";

/**
 * Fetch books from dBooks API by keyword
 * - Calls https://www.dbooks.org/api/search/:keyword
 * - Returns an array of book metadata
 */
async function fetchBooksByKeyword(keyword) {
  const res = await axios.get(`https://www.dbooks.org/api/search/${keyword}`);
  return res.data.books || [];
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
 */
function mapToBookModel(book) {
  return {
    title: book.title,
    author: book.authors,
    description: book.description || "No description available.",
    fileUrl: book.url,
    coverUrl: book.image,
    tags: book.subject ? book.subject.slice(0, 5) : [],
    isPremium: Math.random() < 0.3, // Randomly mark 30% as premium
    source: "dbook",
    downloadUrl: book.url
  };
}

/**
 * Seed books from dBooks API into local database
 * - Loops through multiple keywords
 */
export async function seedBooksFromDBooks() {
  try {
    const keywords = [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "science",
      "history"
    ];
    let addedCount = 0,
      skippedCount = 0,
      errorCount = 0;

    for (const keyword of keywords) {
      console.log(`🔎 Fetching books for keyword "${keyword}"...`);
      const books = await fetchBooksByKeyword(keyword);

      for (const book of books) {
        try {
          const detail = await fetchBookDetail(book.id);
          const mapped = mapToBookModel(detail);

          // Check for duplicates
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
    }

    console.log(`🎉 Finished seeding books from dBooks!`);
    console.log(
      `📊 Summary: ${addedCount} added, ${skippedCount} skipped, ${errorCount} errors.`
    );
  } catch (error) {
    console.error("❌ Error while seeding books:", error.message);
  }
}
