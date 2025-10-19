#!/usr/bin/env node

/**
 * Script to scrape IB Past Papers and populate practice_papers collection
 * Source: https://dl.ibdocs.re/IB%20PAST%20PAPERS%20-%20SUBJECT/
 *
 * Usage:
 *   node scripts/addPastPapersCollection.js
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

// Base URL for IB Past Papers
const BASE_URL = 'https://dl.ibdocs.re/IB%20PAST%20PAPERS%20-%20SUBJECT/';

// Subject mapping to match CardWise subjects
const SUBJECT_MAPPING = {
  'Biology': 'biology',
  'Chemistry': 'chemistry',
  'Physics': 'physics',
  'Mathematics': 'mathematics',
  'Economics': 'economics',
  'Business Management': 'business',
  'Business and Management': 'business',
  'Psychology': 'psychology',
  'Computer Science': 'computer-science',
  'Geography': 'geography',
  'History': 'history',
  'English': 'english',
  'English A Language and Literature': 'english',
  'English A Literature': 'english',
  'Theory of Knowledge': 'tok'
};

let stats = {
  papersAdded: 0,
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
 * Parse paper filename to extract metadata
 */
function parsePaperFilename(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.(pdf|PDF)$/, '');

  // Common patterns:
  // "Biology_paper_1__TZ1_SL.pdf"
  // "Chemistry HL Paper 2 TZ2 May 2023.pdf"
  // "Economics_SL_Paper_1_TZ1_markscheme.pdf"

  const metadata = {
    subject: null,
    level: null, // HL or SL
    paperNumber: null,
    timezone: null, // TZ1, TZ2, TZ0
    session: null, // May, November
    year: null,
    isMarkscheme: filename.toLowerCase().includes('markscheme') || filename.toLowerCase().includes('ms'),
    originalFilename: filename
  };

  // Extract level
  if (/\bHL\b/i.test(nameWithoutExt)) {
    metadata.level = 'HL';
  } else if (/\bSL\b/i.test(nameWithoutExt)) {
    metadata.level = 'SL';
  }

  // Extract paper number
  const paperMatch = nameWithoutExt.match(/[Pp]aper[\s_]*(\d)/);
  if (paperMatch) {
    metadata.paperNumber = parseInt(paperMatch[1]);
  }

  // Extract timezone
  const tzMatch = nameWithoutExt.match(/TZ(\d)/i);
  if (tzMatch) {
    metadata.timezone = `TZ${tzMatch[1]}`;
  }

  // Extract session
  if (/\bMay\b/i.test(nameWithoutExt)) {
    metadata.session = 'May';
  } else if (/\bNovember\b|Nov\b/i.test(nameWithoutExt)) {
    metadata.session = 'November';
  }

  // Extract year (4 digits)
  const yearMatch = nameWithoutExt.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    metadata.year = parseInt(yearMatch[1]);
  }

  return metadata;
}

/**
 * Recursively crawl directories to find past paper files
 */
async function crawlDirectory(url, subject = null, path = []) {
  console.log(`\n📂 Crawling: ${url}`);

  const items = await fetchDirectory(url);
  const papers = [];

  for (const item of items) {
    if (item.isFolder) {
      // Determine subject from folder name if not set
      let currentSubject = subject;
      if (!currentSubject) {
        // Check if folder name matches a known subject
        for (const [key, value] of Object.entries(SUBJECT_MAPPING)) {
          if (item.name.includes(key)) {
            currentSubject = value;
            console.log(`📚 Found subject: ${item.name} -> ${currentSubject}`);
            break;
          }
        }
      }

      // Recursively crawl subdirectories
      const subPapers = await crawlDirectory(item.url, currentSubject, [...path, item.name]);
      papers.push(...subPapers);

    } else if (item.name.match(/\.(pdf|PDF)$/)) {
      // Found a PDF file (past paper)
      const metadata = parsePaperFilename(item.name);

      // Only include papers from 2012 onwards
      if (metadata.year && metadata.year >= 2012) {
        const paperData = {
          title: cleanPaperTitle(item.name),
          fileName: item.name,
          downloadUrl: item.url,
          subject: subject || 'miscellaneous',
          level: metadata.level,
          paperNumber: metadata.paperNumber,
          timezone: metadata.timezone,
          session: metadata.session,
          year: metadata.year,
          isMarkscheme: metadata.isMarkscheme,
          category: path[0] || 'IB Past Papers',
          subcategory: path[1] || null,
          addedAt: new Date()
        };

        papers.push(paperData);
        console.log(`  📄 Found: ${paperData.title} (${metadata.year})`);
      } else if (metadata.year) {
        console.log(`  ⏭️  Skipped: ${cleanPaperTitle(item.name)} (${metadata.year} - before 2012)`);
      } else {
        // Include papers without year metadata
        const paperData = {
          title: cleanPaperTitle(item.name),
          fileName: item.name,
          downloadUrl: item.url,
          subject: subject || 'miscellaneous',
          level: metadata.level,
          paperNumber: metadata.paperNumber,
          timezone: metadata.timezone,
          session: metadata.session,
          year: metadata.year,
          isMarkscheme: metadata.isMarkscheme,
          category: path[0] || 'IB Past Papers',
          subcategory: path[1] || null,
          addedAt: new Date()
        };

        papers.push(paperData);
        console.log(`  📄 Found: ${paperData.title} (no year)`);
      }
    }
  }

  return papers;
}

/**
 * Clean paper title from filename
 */
function cleanPaperTitle(filename) {
  return filename
    .replace(/\.(pdf|PDF)$/, '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if paper already exists in Firestore
 */
async function checkExistingPapers() {
  console.log('\n🔍 Checking existing papers in Firestore...');
  const snapshot = await db.collection('practice_papers').get();
  const existingPapers = new Set();

  snapshot.forEach(doc => {
    const data = doc.data();
    // Create unique key based on downloadUrl (most reliable identifier)
    if (data.downloadUrl) {
      existingPapers.add(data.downloadUrl);
    }
  });

  console.log(`📊 Found ${existingPapers.size} existing papers in database`);
  return existingPapers;
}

/**
 * Upload papers to Firestore (skips duplicates)
 */
async function uploadPapers(papers, existingPapers) {
  console.log(`\n📤 Uploading ${papers.length} past papers to Firestore...`);

  let batch = db.batch();
  let batchCount = 0;
  let totalUploaded = 0;
  let skipped = 0;

  for (let i = 0; i < papers.length; i++) {
    const paper = papers[i];

    // Skip if already exists
    if (existingPapers.has(paper.downloadUrl)) {
      skipped++;
      continue;
    }

    const docRef = db.collection('practice_papers').doc();
    batch.set(docRef, paper);
    batchCount++;

    // Firestore batch limit is 500
    if (batchCount >= 500) {
      await batch.commit();
      totalUploaded += batchCount;
      console.log(`✅ Uploaded batch of ${batchCount} papers (Total: ${totalUploaded}/${papers.length - skipped}, Skipped: ${skipped})`);

      // Reset for next batch
      batchCount = 0;
      batch = db.batch();
    }
  }

  // Commit remaining papers
  if (batchCount > 0) {
    await batch.commit();
    totalUploaded += batchCount;
    console.log(`✅ Uploaded final batch of ${batchCount} papers (Total: ${totalUploaded}/${papers.length - skipped}, Skipped: ${skipped})`);
  }

  console.log(`\n📊 Duplicate Check Summary:`);
  console.log(`   New papers uploaded: ${totalUploaded}`);
  console.log(`   Duplicates skipped: ${skipped}`);

  stats.papersAdded = totalUploaded;
  stats.skipped = skipped;
}

/**
 * Crawl specific subject folders
 */
async function crawlSubjects() {
  // We'll crawl the main directory and let it discover subjects
  const papers = await crawlDirectory(BASE_URL);
  return papers;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Past Papers Collection Creation...');
  console.log('📚 Source: https://dl.ibdocs.re/IB%20PAST%20PAPERS%20-%20SUBJECT/\n');

  try {
    // Check existing papers in Firestore
    const existingPapers = await checkExistingPapers();

    // Crawl and collect all past papers
    const papers = await crawlSubjects();

    if (papers.length === 0) {
      console.log('⚠️  No past papers found. The directory structure may have changed.');
      process.exit(1);
    }

    console.log(`\n📊 Found ${papers.length} past papers total`);

    // Upload to Firestore (skipping duplicates)
    await uploadPapers(papers, existingPapers);

    // Print statistics
    console.log('\n📊 Upload Summary:');
    console.log('════════════════════');
    console.log(`📄 Past Papers Added: ${stats.papersAdded}`);
    console.log(`🔄 Duplicates Skipped: ${stats.skipped || 0}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('════════════════════');

    console.log('\n✅ Past Papers collection created successfully!');

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
