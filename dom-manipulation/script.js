// --------------------
// Initialization
// --------------------
let quotes = [];
let selectedCategory = 'all';

// --------------------
// Local Storage Utilities
// --------------------
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
      { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
    ];
    saveQuotes();
  }
}

// --------------------
// DOM Manipulation
// --------------------
function displayQuotes(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = "<p>No quotes to display.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  document.getElementById('quoteDisplay').innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p class="category">Category: ${randomQuote.category}</p>
  `;

  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    selectedCategory = savedCategory;
    filterQuotes();
  }
}

// --------------------
// Add & Filter Quotes
// --------------------
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  if (!textInput.value || !categoryInput.value) return;

  const newQuote = { text: textInput.value, category: categoryInput.value };
  quotes.push(newQuote);
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  populateCategories();
  filterQuotes();
}

function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter').value;
  selectedCategory = categoryFilter;
  localStorage.setItem('selectedCategory', selectedCategory);

  if (selectedCategory === 'all') {
    displayQuotes(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === selectedCategory);
    displayQuotes(filtered);
  }
}

// --------------------
// JSON Export / Import
// --------------------
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// --------------------
// Server Sync & Conflict Resolution
// --------------------
async function fetchQuotesFromServer() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const data = await res.json();
  return data.map(post => ({ text: post.title, category: 'General' }));
}

function resolveConflicts(serverQuotes, localQuotes) {
  // Server takes precedence
  const resolved = [...serverQuotes];
  localQuotes.forEach(lq => {
    if (!serverQuotes.some(sq => sq.text === lq.text)) {
      resolved.push(lq);
    }
  });
  return resolved;
}

async function syncWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  const localQuotes = JSON.parse(localStorage.getItem('quotes')) || [];

  quotes = resolveConflicts(serverQuotes, localQuotes);
  saveQuotes();
  populateCategories();
  filterQuotes();
  showNotification('Quotes synced with server!');
}

// --------------------
// Notifications
// --------------------
function showNotification(message) {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.cssText = `
    background: green; color: white; padding: 10px;
    position: fixed; bottom: 10px; right: 10px; border-radius: 6px;
  `;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 4000);
}

// --------------------
// Event Listeners
// --------------------
document.getElementById('newQuote').addEventListener('click', () => filterQuotes());
document.getElementById('addQuote').addEventListener('click', addQuote);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// --------------------
// Initialize App
// --------------------
loadQuotes();
populateCategories();
filterQuotes();
syncWithServer();
setInterval(syncWithServer, 60000); // Sync every 60s
