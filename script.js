// Array to store all transactions
let transactions = [];

// Get DOM elements
const descriptionInput = document.getElementById('transaction-description');
const amountInput = document.getElementById('transaction-amount');
const dateInput = document.getElementById('transaction-date');
const typeRadios = document.querySelectorAll('input[name="transaction-type"]');
const addTransactionBtn = document.getElementById('add-transaction-btn');

// Top Summary Elements
const totalIncomeTopDisplay = document.getElementById('total-income-top');
const totalExpenseTopDisplay = document.getElementById('total-expense-top');
const balanceTopDisplay = document.getElementById('balance-top');

const transactionList = document.getElementById('transaction-list');
const noTransactionsMessage = document.getElementById('no-transactions-message');

// Bottom Summary Elements (for all transactions)
const totalIncomeBottomDisplay = document.getElementById('total-income-bottom');
const totalExpenseBottomDisplay = document.getElementById('total-expense-bottom');
const balanceBottomDisplay = document.getElementById('balance-bottom');


/**
 * Initializes the application by loading transactions from LocalStorage
 * and setting up event listeners.
 */
function initializeApp() {
    loadTransactions();
    setDefaultDate();
    addEventListeners();
    renderTransactions(); // Initial render
    updateSummary(); // Initial summary update
}

/**
 * Sets the default date input to the current date.
 */
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
}

/**
 * Adds all necessary event listeners to interactive elements.
 */
function addEventListeners() {
    addTransactionBtn.addEventListener('click', addTransaction);
}

/**
 * Loads transactions from LocalStorage.
 */
function loadTransactions() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
}

/**
 * Saves the current transactions array to LocalStorage.
 */
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

/**
 * Adds a new transaction based on user input.
 */
function addTransaction() {
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const type = document.querySelector('input[name="transaction-type"]:checked').value;
    const now = new Date();
    const time = now.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }); // Format time as HH:MM

    // Basic validation
    if (!description || isNaN(amount) || amount <= 0 || !date) {
        showMessage('សូមបញ្ចូលព័ត៌មានប្រតិបត្តិការឱ្យបានពេញលេញ និងត្រឹមត្រូវ។ (ចំនួនទឹកប្រាក់ត្រូវតែជាលេខវិជ្ជមាន)', 'red');
        return;
    }

    const newTransaction = {
        id: Date.now().toString(), // Unique ID for each transaction
        description,
        amount,
        date,
        time, // Store the time
        type
    };

    transactions.push(newTransaction);
    saveTransactions();
    clearForm();
    renderTransactions(); // Re-render to show new transaction
    updateSummary(); // Update summary
    showMessage('ប្រតិបត្តិការត្រូវបានបន្ថែមដោយជោគជ័យ!', 'green');
}

/**
 * Clears the transaction input form fields.
 */
function clearForm() {
    descriptionInput.value = '';
    amountInput.value = '';
    setDefaultDate(); // Reset date to current date
    document.querySelector('input[name="transaction-type"][value="income"]').checked = true;
}

/**
 * Renders the transaction list based on the current filter.
 */
function renderTransactions() {
    transactionList.innerHTML = ''; // Clear existing list

    // All transactions will be rendered, no filtering by month
    const transactionsToRender = transactions.slice().sort((a, b) => {
        // Sort by date, then by time (newest first)
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB - dateA;
    });

    if (transactionsToRender.length === 0) {
        noTransactionsMessage.classList.remove('hidden');
    } else {
        noTransactionsMessage.classList.add('hidden');
        transactionsToRender.forEach(transaction => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';

            const amountClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
            const typeText = transaction.type === 'income' ? 'ចំណូល' : 'ចំណាយ';

            row.innerHTML = `
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800">${transaction.date}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800">${transaction.time || ''}</td> <!-- Display time -->
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800">${transaction.description}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium ${amountClass}">${transaction.amount.toLocaleString('km-KH')} ៛</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-800">${typeText}</td>
                <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium no-print">
                    <button data-id="${transaction.id}" class="delete-btn text-red-600 hover:text-red-900 ml-2">លុប</button>
                </td>
            `;
            transactionList.appendChild(row);
        });
    }
    updateSummary(); // Update summary based on all transactions
    addDeleteEventListeners(); // Add listeners to new delete buttons
}

/**
 * Adds event listeners to all delete buttons.
 */
function addDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.removeEventListener('click', deleteTransaction); // Prevent duplicate listeners
        button.addEventListener('click', deleteTransaction);
    });
}

/**
 * Deletes a transaction by its ID.
 * @param {Event} event - The click event from the delete button.
 */
function deleteTransaction(event) {
    const transactionId = event.target.dataset.id;
    // Using a custom message box instead of confirm()
    showConfirmationModal('តើអ្នកពិតជាចង់លុបប្រតិបត្តិការនេះមែនទេ?', () => {
        transactions = transactions.filter(t => t.id !== transactionId);
        saveTransactions();
        renderTransactions();
        updateSummary();
        showMessage('ប្រតិបត្តិការត្រូវបានលុបដោយជោគជ័យ!', 'green');
    });
}

/**
 * Displays a confirmation modal instead of alert/confirm.
 * @param {string} message - The message to display in the modal.
 * @param {function} onConfirm - Callback function to execute if user confirms.
 */
function showConfirmationModal(message, onConfirm) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
    modalOverlay.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <p class="text-lg font-semibold mb-4 text-gray-800">${message}</p>
            <div class="flex justify-center space-x-4">
                <button id="confirm-yes" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out">បាទ/ចាស</button>
                <button id="confirm-no" class="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-150 ease-in-out">ទេ</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    document.getElementById('confirm-yes').addEventListener('click', () => {
        onConfirm();
        modalOverlay.remove();
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        modalOverlay.remove();
    });
}

/**
 * Updates the total income, total expense, and balance displayed for both top and bottom summaries.
 */
function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    const balance = totalIncome - totalExpense;

    // Update top summary
    totalIncomeTopDisplay.textContent = `${totalIncome.toLocaleString('km-KH')} ៛`;
    totalExpenseTopDisplay.textContent = `${totalExpense.toLocaleString('km-KH')} ៛`;
    balanceTopDisplay.textContent = `${balance.toLocaleString('km-KH')} ៛`;

    // Apply color based on balance for top summary
    if (balance >= 0) {
        balanceTopDisplay.classList.remove('text-red-800');
        balanceTopDisplay.classList.add('text-green-800');
    } else {
        balanceTopDisplay.classList.remove('text-green-800');
        balanceTopDisplay.classList.add('text-red-800');
    }

    // Update bottom summary
    totalIncomeBottomDisplay.textContent = `${totalIncome.toLocaleString('km-KH')} ៛`;
    totalExpenseBottomDisplay.textContent = `${totalExpense.toLocaleString('km-KH')} ៛`;
    balanceBottomDisplay.textContent = `${balance.toLocaleString('km-KH')} ៛`;

    // Apply color based on balance for bottom summary
    if (balance >= 0) {
        balanceBottomDisplay.classList.remove('text-red-700');
        balanceBottomDisplay.classList.add('text-green-700');
    } else {
        balanceBottomDisplay.classList.remove('text-green-700');
        balanceBottomDisplay.classList.add('text-red-700');
    }
}

/**
 * Displays a temporary message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of message (e.g., 'green' for success, 'red' for error, 'orange' for warning).
 */
function showMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = `fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300 ease-out`;

    if (type === 'green') {
        messageBox.classList.add('bg-green-500');
    } else if (type === 'red') {
        messageBox.classList.add('bg-red-500');
    } else if (type === 'orange') {
        messageBox.classList.add('bg-orange-500');
    } else {
        messageBox.classList.add('bg-gray-700');
    }

    document.body.appendChild(messageBox);

    // Fade out and remove after 3 seconds
    setTimeout(() => {
        messageBox.style.opacity = '0';
        setTimeout(() => {
            messageBox.remove();
        }, 300);
    }, 3000);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeApp);
