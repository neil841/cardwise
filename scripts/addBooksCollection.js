#!/usr/bin/env node

/**
 * Script to create Books collection and populate with IB textbooks data
 * Crawls https://dl.ibdocs.re/IB%20BOOKS/ and adds all books to Firestore
 *
 * Usage:
 *   node scripts/addBooksCollection.js
 */

const admin = require('firebase-admin');
const axios = require('axios');
const cheerio = require('cheerio');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Base URL for IB Docs
const BASE_URL = 'https://dl.ibdocs.re/IB%20BOOKS/';

// Subject mapping to match CardWise subjects
const SUBJECT_MAPPING = {
  'Biology': 'biology',
  'Chemistry': 'chemistry',
  'Physics': 'physics',
  'Mathematics': 'mathematics',
  'Economics': 'economics',
  'Business Management': 'business',
  'Psychology': 'psychology',
  'Computer Science': 'computer-science',
  'Geography': 'geography',
  'History': 'history',
  'English': 'english',
  'Theory of Knowledge': 'tok',
  'Extended Essay': 'ee'
};

let stats = {
  booksAdded: 0,
  errors: 0
};

/**
 * Fetch and parse directory listing
 */
async function fetchDirectory(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const items = [];

    // Parse h5ai directory listing (fallback table format)
    $('#fallback table tr').each((i, row) => {
      const $row = $(row);
      const $link = $row.find('td.fb-n a');

      if ($link.length > 0) {
        const href = $link.attr('href');
        const name = $link.text().trim();

        // Skip parent directory and header
        if (href && name && href !== '..' && !name.includes('Parent Directory') && !name.includes('Name')) {
          const isFolder = href.endsWith('/');
          const fullUrl = href.startsWith('http') ? href : 'https://dl.ibdocs.re' + href;

          items.push({
            name: name.replace(/\/$/, ''),
            href: href,
            url: fullUrl,
            isFolder: isFolder
          });
        }
      }
    });

    return items;
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    return [];
  }
}

/**
 * Recursively crawl directories to find book files
 */
async function crawlDirectory(url, subject = null, path = []) {
  console.log(`\n📂 Crawling: ${url}`);

  const items = await fetchDirectory(url);
  const books = [];

  for (const item of items) {
    if (item.isFolder) {
      // Determine subject from folder name if not set
      let currentSubject = subject;
      if (!currentSubject && SUBJECT_MAPPING[item.name]) {
        currentSubject = SUBJECT_MAPPING[item.name];
        console.log(`📚 Found subject: ${item.name} -> ${currentSubject}`);
      }

      // Recursively crawl subdirectories
      const subBooks = await crawlDirectory(item.url, currentSubject, [...path, item.name]);
      books.push(...subBooks);

    } else if (item.name.match(/\.(pdf|epub)$/i)) {
      // Found a book file
      const bookData = {
        title: cleanBookTitle(item.name),
        fileName: item.name,
        downloadUrl: item.url,
        subject: subject || 'miscellaneous',
        category: path[0] || 'IB Books',
        subcategory: path[1] || null,
        fileType: item.name.split('.').pop().toLowerCase(),
        addedAt: new Date()
      };

      books.push(bookData);
      console.log(`  📖 Found: ${bookData.title}`);
    }
  }

  return books;
}

/**
 * Clean book title from filename
 */
function cleanBookTitle(filename) {
  return filename
    .replace(/\.(pdf|epub)$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Upload books to Firestore
 */
async function uploadBooks(books) {
  console.log(`\n📤 Uploading ${books.length} books to Firestore...`);

  let batch = db.batch();
  let batchCount = 0;
  let totalUploaded = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const docRef = db.collection('books').doc();
    batch.set(docRef, book);
    batchCount++;

    // Firestore batch limit is 500
    if (batchCount >= 500) {
      await batch.commit();
      totalUploaded += batchCount;
      console.log(`✅ Uploaded batch of ${batchCount} books (Total: ${totalUploaded}/${books.length})`);

      // Reset for next batch
      batchCount = 0;
      batch = db.batch();
    }
  }

  // Commit remaining books
  if (batchCount > 0) {
    await batch.commit();
    totalUploaded += batchCount;
    console.log(`✅ Uploaded final batch of ${batchCount} books (Total: ${totalUploaded}/${books.length})`);
  }

  stats.booksAdded = totalUploaded;
}

/**
 * Crawl specific subject groups
 */
async function crawlSubjectGroups() {
  const groups = [
    'Group%203%20-%20Individuals%20and%20Societies/',
    'Group%204%20-%20Sciences/',
    'Group%205%20-%20Mathematics/',
    'Group%201%20-%20Studies%20in%20Language%20and%20Literature/',
    'Group%202%20-%20Language%20Acquisition/',
    'Group%206%20-%20The%20Arts/',
    'Core/',
    'Miscellaneous/'
  ];

  let allBooks = [];

  for (const group of groups) {
    const books = await crawlDirectory(BASE_URL + group);
    allBooks.push(...books);
  }

  return allBooks;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Books Collection Creation...');
  console.log('📚 Source: https://dl.ibdocs.re/IB%20BOOKS/\n');

  try {
    // Crawl and collect all books
    const books = await crawlSubjectGroups();

    if (books.length === 0) {
      console.log('⚠️  No books found. The directory structure may have changed.');
      process.exit(1);
    }

    console.log(`\n📊 Found ${books.length} books total`);

    // Upload to Firestore
    await uploadBooks(books);

    // Print statistics
    console.log('\n📊 Upload Summary:');
    console.log('════════════════════');
    console.log(`📖 Books Added: ${stats.booksAdded}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('════════════════════');

    console.log('\n✅ Books collection created successfully!');

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
main();
