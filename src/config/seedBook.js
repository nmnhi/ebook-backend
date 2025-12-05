// seedBooks.js
import axios from "axios";
import fetch from "node-fetch";
import { createBook, findBookByFileUrl } from "../models/bookModel.js";
import { uploadToSupabase } from "../services/uploadService.js";

/**
 * Fetch books from dBooks API by keyword
 */
async function fetchBooksByKeyword(keyword) {
  try {
    const res = await axios.get(`https://www.dbooks.org/api/search/${keyword}`);
    return res.data.books || [];
  } catch (err) {
    console.error(`❌ Failed to fetch keyword "${keyword}":`, err.message);
    return [];
  }
}

/**
 * Fetch detailed book info by ID
 */
async function fetchBookDetail(bookId) {
  const res = await axios.get(`https://www.dbooks.org/api/book/${bookId}`);
  return res.data;
}

/**
 * Download PDF from dBooks (temporary link)
 */
async function downloadPdf(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/pdf",
        Referer: "https://www.dbooks.org/"
      }
    });

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("pdf")) {
      console.log("⚠️ Not a PDF, skipping download:", url);
      return null;
    }

    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error("❌ Failed to download PDF:", err.message);
    return null;
  }
}

/**
 * Map dBooks API response to local Book model
 */
function mapToBookModel(book, pdfUrl) {
  return {
    title: book.title,
    author: book.authors,
    description: book.description || "No description available.",
    fileUrl: book.url,
    coverUrl: book.image,
    tags: book.subject ? book.subject.slice(0, 5) : [],
    isPremium: Math.random() < 0.3,
    source: "dbook",
    download_url: pdfUrl // ✅ now using Supabase URL
  };
}

/**
 * Seed books from dBooks API into local database
 */
export async function seedBooksFromDBooks() {
  try {
    const keywords = ["react"]; // ✅ You can add more later

    let addedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const keyword of keywords) {
      console.log(`🔎 Fetching books for keyword "${keyword}"...`);
      const books = await fetchBooksByKeyword(keyword);

      for (const book of books) {
        try {
          const detail = await fetchBookDetail(book.id);

          // ✅ Check duplicate by fileUrl
          const exists = await findBookByFileUrl(detail.url);
          if (exists) {
            console.log(`⚠️ Skipped (already exists): ${detail.title}`);
            skippedCount++;
            continue;
          }

          // ✅ Download PDF first
          const pdfBuffer = await downloadPdf(detail.download);
          if (!pdfBuffer) {
            console.log(`⚠️ Skipped (PDF missing): ${detail.title}`);
            skippedCount++;
            continue;
          }

          // ✅ Upload to Supabase
          const filePath = `books/${detail.id}.pdf`;
          const publicUrl = await uploadToSupabase(
            "books",
            filePath,
            pdfBuffer,
            "application/pdf"
          );

          console.log(`📚 Uploaded PDF → ${publicUrl}`);

          // ✅ Map book with Supabase URL
          const mapped = mapToBookModel(detail, publicUrl);

          // ✅ Save to DB
          const saved = await createBook(mapped);
          console.log(`✅ Seeded: ${saved.title}`);
          addedCount++;
        } catch (err) {
          console.error(`❌ Error seeding book ID ${book.id}:`, err.message);
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
