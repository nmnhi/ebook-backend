// seedBooks.js
import axios from "axios";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";

async function fetchRecentBooks() {
  const res = await axios.get("https://www.dbooks.org/api/recent");
  return res.data.books;
}

async function fetchBookDetail(bookId) {
  const res = await axios.get(`https://www.dbooks.org/api/book/${bookId}`);
  return res.data;
}

function mapToBookModel(book) {
  return {
    title: book.title,
    author: book.authors,
    description: book.description || "No description available.",
    fileUrl: book.url,
    coverUrl: book.image,
    tags: [],
    isPremium: Math.random() < 0.3 // Randomly mark 30% of books as premium for testing
  };
}

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
