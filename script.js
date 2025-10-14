let sessions = [];
let currentSession = 0;

function saveToStorage() {
    localStorage.setItem('sessions', JSON.stringify(sessions));
    localStorage.setItem('currentSession', currentSession);
}

function loadFromStorage() {
    const s = localStorage.getItem('sessions');
    if (s) sessions = JSON.parse(s);
    const c = localStorage.getItem('currentSession');
    if (c !== null) currentSession = parseInt(c);
}

function showMainContent() {
    const main = document.getElementById('mainContent');
    main.style.display = sessions.length > 0 ? 'block' : 'none';
    showWelcome();
}

function showWelcome() {
    const welcome = document.getElementById('welcome');
    welcome.style.display = sessions.length === 0 ? 'block' : 'none';
}

function updateCurrentSession() {
    const cs = document.getElementById('currentSession');
    const nameSpan = document.getElementById('sessionName');
    const deleteBtn = document.getElementById('deleteBtn');
    if (sessions.length > 0) {
        cs.style.display = 'block';
        nameSpan.textContent = sessions[currentSession].name;
        deleteBtn.style.display = 'inline';
    } else {
        cs.style.display = 'none';
        nameSpan.textContent = '';
        deleteBtn.style.display = 'none';
    }
}

function deleteSession() {
    if (sessions.length === 0) return;
    if (confirm(`Session "${sessions[currentSession].name}" wirklich löschen?`)) {
        sessions.splice(currentSession, 1);
        if (sessions.length === 0) {
            currentSession = -1;
        } else if (currentSession >= sessions.length) {
            currentSession = sessions.length - 1;
        }
        updateSessionSelect();
        loadSession();
        saveToStorage();
    }
}

function updateSessionSelect() {
    const select = document.getElementById('sessionSelect');
    select.innerHTML = '';
    sessions.forEach((session, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = session.name;
        if (index === currentSession) option.selected = true;
        select.appendChild(option);
    });
}

function loadSession() {
    if (sessions.length === 0) {
        currentSession = -1;
        showMainContent();
        updateCurrentSession();
        return;
    }
    if (currentSession >= sessions.length) currentSession = 0;
    const session = sessions[currentSession];
    people = session.people;
    expenses = session.expenses;
    updatePeopleList();
    updateExpensesList();
    document.getElementById('results').innerHTML = '';
    showMainContent();
    updateCurrentSession();
}

function switchSession() {
    currentSession = parseInt(document.getElementById('sessionSelect').value);
    loadSession();
    saveToStorage();
}

function addSession() {
    const name = document.getElementById('newSessionName').value.trim();
    if (name) {
        sessions.push({ name: name, people: [], expenses: [] });
        currentSession = sessions.length - 1;
        updateSessionSelect();
        loadSession();
        saveToStorage();
        document.getElementById('newSessionName').value = '';
        document.getElementById('menu').style.display = 'none';
    } else {
        alert('Bitte einen Namen für die neue Session eingeben!');
    }
}

let people = [];
let expenses = [];

function addPerson() {
    const name = document.getElementById('personName').value.trim();
    if (name && !people.includes(name)) {
        people.push(name);
        sessions[currentSession].people = people;
        updatePeopleList();
        saveToStorage();
        document.getElementById('personName').value = '';
    } else if (people.includes(name)) {
        alert('Person bereits hinzugefügt!');
    }
}

function updatePeopleList() {
    const list = document.getElementById('peopleList');
    list.innerHTML = '';
    people.forEach(person => {
        const li = document.createElement('li');
        li.textContent = person;
        list.appendChild(li);
    });
}

function addExpense() {
    const desc = document.getElementById('expenseDesc').value.trim();
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    if (desc && amount > 0) {
        expenses.push({ desc, amount });
        sessions[currentSession].expenses = expenses;
        updateExpensesList();
        saveToStorage();
        document.getElementById('expenseDesc').value = '';
        document.getElementById('expenseAmount').value = '';
    } else {
        alert('Bitte gültige Beschreibung und Betrag eingeben!');
    }
}

function updateExpensesList() {
    const list = document.getElementById('expensesList');
    list.innerHTML = '';
    expenses.forEach(expense => {
        const li = document.createElement('li');
        li.textContent = `${expense.desc}: ${expense.amount.toFixed(2)} €`;
        list.appendChild(li);
    });
}

function calculateSplit() {
    if (people.length === 0) {
        alert('Bitte zuerst Personen hinzufügen!');
        return;
    }
    if (expenses.length === 0) {
        alert('Bitte zuerst Ausgaben hinzufügen!');
        return;
    }
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const perPerson = total / people.length;
    const results = document.getElementById('results');
    results.innerHTML = `<p><strong>Gesamtbetrag:</strong> ${total.toFixed(2)} €</p>
                         <p><strong>Pro Person:</strong> ${perPerson.toFixed(2)} €</p>
                         <p>Annahme: Gleiche Aufteilung für alle.</p>`;
}

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
});

// Menu Toggle
document.getElementById('menuToggle').addEventListener('click', () => {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Load on startup
window.addEventListener('load', () => {
    loadFromStorage();
    updateSessionSelect();
    loadSession();
    document.getElementById('sessionSelect').addEventListener('change', switchSession);
    document.getElementById('personName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addPerson();
    });
    document.getElementById('expenseDesc').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addExpense();
    });
    document.getElementById('expenseAmount').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addExpense();
    });
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark');
    }
});

// PWA Install
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'block';
});

document.getElementById('installBtn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    }
});
