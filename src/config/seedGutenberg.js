// seedGutenberg.js
import axios from "axios";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";

/**
 * Fetch books from Gutenberg (Gutendex API)
 * - Bọc lỗi để tránh crash khi gặp 404 hoặc lỗi mạng
 */
async function fetchGutenbergBooks(query = "literature", page = 1) {
  try {
    const res = await axios.get(
      `https://gutendex.com/books?search=${query}&page=${page}`
    );
    return res.data.results || [];
  } catch (err) {
    console.error(`❌ Failed to fetch "${query}" page ${page}:`, err.message);
    return [];
  }
}

/**
 * Map Gutenberg API response to local Book model
 * - Chỉ trả về sách có định dạng EPUB hoặc HTML
 */
function mapToBookModel(book) {
  const epub = book.formats["application/epub+zip"];
  const html = book.formats["text/html"];
  const downloadUrl = epub || html;

  if (!downloadUrl) return null;

  const tags = Array.isArray(book.subjects)
    ? [...new Set(book.subjects.map((t) => t.trim().toLowerCase()))].slice(0, 8)
    : [];

  return {
    title: book.title,
    author: book.authors.map((a) => a.name).join(", "),
    description: tags.join(", ") || "No description available.",
    fileUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
    coverUrl: book.formats["image/jpeg"] || null,
    tags,
    isPremium: false,
    source: "gutenberg",
    downloadUrl
  };
}

/**
 * Seed books from multiple topics and pages
 */
export async function seedBooksFromGutenberg() {
  try {
    const topics = [
      "literature",
      "science",
      "history",
      "philosophy",
      "technology"
    ];
    let addedCount = 0,
      skippedCount = 0,
      formatSkipped = 0;

    for (const topic of topics) {
      for (let page = 1; page <= 2; page++) {
        console.log(`📖 Fetching topic "${topic}" page ${page}...`);
        const books = await fetchGutenbergBooks(topic, page);

        if (books.length === 0) {
          console.log(`⚠️ No books found for "${topic}" page ${page}`);
          continue;
        }

        for (const book of books) {
          const mapped = mapToBookModel(book);

          if (!mapped) {
            console.log(`⛔ Skipped (no valid format): ${book.title}`);
            formatSkipped++;
            continue;
          }

          const exists = await findBookByFileUrl(mapped.fileUrl);
          if (exists) {
            console.log(`⚠️ Skipped (already exists): ${mapped.title}`);
            skippedCount++;
            continue;
          }

          await createBook(mapped);
          console.log(`✅ Seeded: ${mapped.title}`);
          addedCount++;
        }
      }
    }

    console.log(`🎉 Gutenberg seeding done!`);
    console.log(
      `📊 Summary: ${addedCount} added, ${skippedCount} skipped, ${formatSkipped} skipped (no format)`
    );
  } catch (err) {
    console.error("❌ Error seeding Gutenberg books:", err.message);
  }
}
