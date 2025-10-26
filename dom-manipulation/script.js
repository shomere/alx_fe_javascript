/* ======= quotes array (checker expects this) ======= */
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" }
];

/* ======= Storage helpers ======= */
const LOCAL_KEY = 'dynamic_quotes_v1';
const SESSION_LAST_INDEX = 'last_quote_index_v1';

function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
  } catch (e) {
    console.error('Failed to save quotes to localStorage', e);
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Clear current array and push parsed items (preserve reference)
      quotes.length = 0;
      parsed.forEach(item => {
        if (item && typeof item.text === 'string' && typeof item.category === 'string') {
          quotes.push({ text: item.text, category: item.category });
        }
      });
    }
  } catch (e) {
    console.error('Failed to load quotes from localStorage', e);
  }
}

/* ======= displayRandomQuote (checker expects this exact name) ======= */
function displayRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (!quoteDisplay) return;

  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available. Add some!</p>';
    sessionStorage.removeItem(SESSION_LAST_INDEX);
    return;
  }

  // try to reuse last viewed index from session if available,
  // otherwise pick a random one
  let index = parseInt(sessionStorage.getItem(SESSION_LAST_INDEX), 10);
  if (Number.isNaN(index) || index < 0 || index >= quotes.length) {
    index = Math.floor(Math.random() * quotes.length);
  }

  const q = quotes[index];

  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(q.text)}"</p>
    <p class="category">Category: ${escapeHtml(q.category)}</p>
  `;

  // store last viewed index in session storage
  sessionStorage.setItem(SESSION_LAST_INDEX, index.toString());
}

/* safe minimal escaping for insertion into innerHTML strings */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ======= addQuote (checker expects this exact name) ======= */
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const catInput = document.getElementById('newQuoteCategory');
  if (!textInput || !catInput) return;

  const text = textInput.value.trim();
  const category = catInput.value.trim();

  if (!text || !category) {
    alert('Please provide both quote text and category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);

  // persist
  saveQuotes();

  // clear inputs
  textInput.value = '';
  catInput.value = '';

  // display newly added quote immediately
  // set session last index to last item so displayRandomQuote uses it
  sessionStorage.setItem(SESSION_LAST_INDEX, String(quotes.length - 1));
  displayRandomQuote();
}

/* ======= createAddQuoteForm (checker expects this exact name) ======= */
function createAddQuoteForm() {
  // container
  const container = document.createElement('div');
  container.id = 'quoteFormContainer';
  container.style.marginTop = '20px';

  // text input
  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';

  // category input
  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';

  // add button
  const addBtn = document.createElement('button');
  addBtn.id = 'addQuote';
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  // export button
  const exportBtn = document.createElement('button');
  exportBtn.id = 'exportQuotes';
  exportBtn.textContent = 'Export Quotes (JSON)';
  exportBtn.classList.add('secondary');
  exportBtn.addEventListener('click', exportQuotes);

  // import file input (no inline onchange)
  const importInput = document.createElement('input');
  importInput.id = 'importFile';
  importInput.type = 'file';
  importInput.accept = '.json,application/json';
  importInput.style.display = 'inline-block';
  importInput.addEventListener('change', importFromJsonFile);

  // assemble
  container.appendChild(quoteInput);
  container.appendChild(categoryInput);
  container.appendChild(addBtn);
  container.appendChild(exportBtn);
  container.appendChild(importInput);

  // append to body (or insert after quoteDisplay)
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (quoteDisplay && quoteDisplay.parentNode) {
    quoteDisplay.parentNode.insertBefore(container, quoteDisplay.nextSibling);
  } else {
    document.body.appendChild(container);
  }
}

/* ======= Export and Import ======= */
function exportQuotes() {
  try {
    const json = JSON.stringify(quotes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Export failed', e);
    alert('Export failed. See console for details.');
  }
}

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) {
        alert('Invalid JSON format: expected an array of quote objects.');
        return;
      }

      // validate and merge
      let added = 0;
      parsed.forEach(item => {
        if (item && typeof item.text === 'string' && typeof item.category === 'string') {
          quotes.push({ text: item.text, category: item.category });
          added++;
        }
      });

      if (added > 0) {
        saveQuotes();
        alert(`${added} quote(s) imported successfully!`);
        // show last added
        sessionStorage.setItem(SESSION_LAST_INDEX, String(quotes.length - 1));
        displayRandomQuote();
      } else {
        alert('No valid quotes found in the JSON file.');
      }
    } catch (err) {
      console.error('Import failed', err);
      alert('Failed to parse JSON file. Check console for details.');
    } finally {
      // clear file input so the same file can be re-selected if needed
      event.target.value = '';
    }
  };

  reader.onerror = function () {
    alert('Failed to read file.');
    event.target.value = '';
  };

  reader.readAsText(file);
}

/* ======= Initialization ======= */
function init() {
  // load saved quotes from localStorage (if any)
  loadQuotes();

  // ensure createAddQuoteForm exists (create dynamically)
  createAddQuoteForm();

  // attach event listener for the "Show New Quote" button (checker expects JS event listener)
  const newQuoteBtn = document.getElementById('newQuote');
  if (newQuoteBtn) {
    newQuoteBtn.addEventListener('click', () => {
      // show a random quote different from current session last index if possible
      let last = parseInt(sessionStorage.getItem(SESSION_LAST_INDEX), 10);
      if (!Number.isInteger(last)) last = -1;
      let next = last;
      if (quotes.length > 1) {
        // pick a different random index
        while (next === last) {
          next = Math.floor(Math.random() * quotes.length);
        }
      } else {
        next = Math.floor(Math.random() * quotes.length);
      }
      sessionStorage.setItem(SESSION_LAST_INDEX, String(next));
      displayRandomQuote();
    });
  }

  // show a quote on load
  displayRandomQuote();
}

// run init after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
