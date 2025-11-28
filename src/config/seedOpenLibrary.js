// seedOpenLibrary.js
import axios from "axios";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";

/**
 * Fetch books from Open Library API
 * @param {string} query - search keyword/topic
 * @param {number} page - page number
 * @returns {Promise<Array>} list of books
 */
async function fetchOpenLibraryBooks(
  query = "programming",
  page = 1,
  minYear = 2024
) {
  try {
    const res = await axios.get(
      `https://openlibrary.org/search.json?q=${query}&page=${page}&limit=20`
    );
    return (res.data.docs || []).filter(
      (book) => book.first_publish_year && book.first_publish_year >= minYear
    );
  } catch (err) {
    console.error(`❌ Failed to fetch "${query}" page ${page}:`, err.message);
    return [];
  }
}

/**
 * Map Open Library API response to local Book model
 */
function mapToBookModel(book) {
  return {
    title: book.title,
    author: book.author_name ? book.author_name.join(", ") : "Unknown",
    description: book.first_sentence
      ? Array.isArray(book.first_sentence)
        ? book.first_sentence.join(" ")
        : book.first_sentence
      : "No description available.",
    fileUrl: `https://openlibrary.org${book.key}`, // unique identifier
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
    tags: book.subject ? book.subject.slice(0, 5) : [],
    isPremium: false, // miễn phí
    source: "openlibrary",
    downloadUrl: `https://openlibrary.org${book.key}`
  };
}

/**
 * Seed books from Open Library API into local database
 * - Loops through multiple topics and pages
 */
export async function seedBooksFromOpenLibrary() {
  try {
    const topics = [
      "programming",
      "literature",
      "science",
      "history",
      "philosophy"
    ];
    let addedCount = 0;
    let skippedCount = 0;

    for (const topic of topics) {
      for (let page = 1; page <= 2; page++) {
        // lấy 3 trang mỗi topic
        console.log(`📖 Fetching topic "${topic}" page ${page}...`);
        const books = await fetchOpenLibraryBooks(topic, page);

        for (const book of books) {
          const mapped = mapToBookModel(book);

          // Check duplicate
          const exists = await findBookByFileUrl(mapped.fileUrl);
          if (exists) {
            console.log(`⚠️ Skipped (already exists): ${mapped.title}`);
            skippedCount++;
            continue;
          }

          const saved = await createBook(mapped);
          console.log(`✅ Seeded: ${saved.title}`);
          addedCount++;
        }
      }
    }

    console.log(`🎉 Finished seeding books from Open Library!`);
    console.log(`📊 Summary: ${addedCount} added, ${skippedCount} skipped.`);
  } catch (error) {
    console.error("❌ Error while seeding Open Library books:", error.message);
  }
}
