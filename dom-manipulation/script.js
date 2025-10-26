let quotes = [];

// Load and Save Quotes
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

// Populate unique categories into the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  // Clear existing options except the first one
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  }
}

// Display a random quote
function displayRandomQuote() {
  if (quotes.length === 0) return;

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  const quoteDisplay = document.getElementById('quoteDisplay');

  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p class="category">Category: ${randomQuote.category}</p>
  `;

  // Save last viewed quote to session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  if (!textInput.value || !categoryInput.value) return;

  const newQuote = { text: textInput.value, category: categoryInput.value };
  quotes.push(newQuote);
  saveQuotes();

  textInput.value = "";
  categoryInput.value = "";

  populateCategories(); // Update dropdown if new category added
  displayRandomQuote();
}

// Filter quotes based on selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory); // Save selection
  const quoteDisplay = document.getElementById('quoteDisplay');

  let filteredQuotes = quotes;
  if (selectedCategory !== 'all') {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p class="category">Category: ${randomQuote.category}</p>
  `;
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', displayRandomQuote);
document.getElementById('addQuote').addEventListener('click', addQuote);

// Initialize
loadQuotes();
populateCategories();
displayRandomQuote();
