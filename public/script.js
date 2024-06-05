document.addEventListener('DOMContentLoaded', loadTransactions);

let transactions = [];

function addTransaction() {
    const category = document.getElementById('category').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const information = document.getElementById('information').value;
    const date = document.getElementById('date').value;

    if (!category || isNaN(amount) || !information || !date) {
        alert('Please fill out all fields');
        return;
    }

    const transaction = { category, amount, information, date };
    transactions.push(transaction);
    saveTransaction(transaction);
    displayTransaction(transaction);
    updateTotal();
}

function displayTransaction(transaction) {
    const transactionList = document.getElementById('transaction-list');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${transaction.category}</td>
        <td>$${transaction.amount.toFixed(2)}</td>
        <td>${transaction.information}</td>
        <td>${transaction.date}</td>
        <td><button class="delete-btn" onclick="deleteTransaction('${transaction._id}')">Delete</button></td>
    `;

    transactionList.appendChild(row);
}

function updateTotal() {
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    document.getElementById('total-amount').textContent = total.toFixed(2);
}

function saveTransaction(transaction) {
    fetch('/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    })
    .then(response => response.json())
    .then(data => {
        transaction._id = data._id; // Add the returned _id to the transaction
    });
}

function loadTransactions() {
    fetch('/transactions')
        .then(response => response.json())
        .then(data => {
            transactions = data;
            transactions.forEach(displayTransaction);
            updateTotal();
        });
}

function deleteTransaction(id) {
    fetch(`/transactions/${id}`, {
        method: 'DELETE'
    })
    .then(() => {
        transactions = transactions.filter(transaction => transaction._id !== id);
        document.getElementById('transaction-list').innerHTML = '';
        transactions.forEach(displayTransaction);
        updateTotal();
    });
}
