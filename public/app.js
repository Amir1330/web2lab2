// Global variables
let token = localStorage.getItem('token');
const API_URL = 'http://localhost:8080/api';

// Show/hide forms
function showForm(formType) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    
    document.querySelector(`button[onclick="showForm('${formType}')"]`).classList.add('active');
    document.getElementById(`${formType}-form`).classList.remove('hidden');
}

// Authentication functions
async function register(e) {
    e.preventDefault();
    const form = document.getElementById('register-form');
    const data = {
        username: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            token = result.token;
            localStorage.setItem('token', token);
            showTasks();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Registration failed');
    }
}

async function login(e) {
    e.preventDefault();
    const form = document.getElementById('login-form');
    const data = {
        email: form.querySelector('input[type="email"]').value,
        password: form.querySelector('input[type="password"]').value
    };

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (response.ok) {
            token = result.token;
            localStorage.setItem('token', token);
            showTasks();
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Login failed');
    }
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('tasks-container').classList.add('hidden');
}

// Task functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        alert('Failed to load tasks');
    }
}

function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        
        const statusButtonClass = task.status === 'completed' ? 'status-btn' : '';
        
        taskElement.innerHTML = `
            <div>
                <h3>${task.title}</h3>
                <p>${task.description || 'No description'}</p>
                <small><i class="far fa-calendar"></i> Due: ${new Date(task.dueDate).toLocaleDateString()}</small>
            </div>
            <div class="task-actions">
                <button class="${statusButtonClass}" onclick="toggleTaskStatus('${task._id}', '${task.status}')">
                    <i class="fas ${task.status === 'completed' ? 'fa-check-circle' : 'fa-circle'}"></i>
                    ${task.status === 'completed' ? 'Completed' : 'Mark Complete'}
                </button>
                <button class="delete-btn" onclick="deleteTask('${task._id}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        `;
        tasksList.appendChild(taskElement);
    });
}

async function addTask(e) {
    e.preventDefault();
    const form = document.getElementById('add-task-form');
    const data = {
        title: form.querySelector('input[type="text"]').value,
        description: form.querySelector('textarea').value,
        dueDate: form.querySelector('input[type="date"]').value
    };

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            form.reset();
            loadTasks();
        }
    } catch (error) {
        alert('Failed to add task');
    }
}

async function toggleTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Failed to update task');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            loadTasks();
        }
    } catch (error) {
        alert('Failed to delete task');
    }
}

// Initialize app
function showTasks() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('tasks-container').classList.remove('hidden');
    loadTasks();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showTasks();
    }
    
    document.getElementById('register-form').addEventListener('submit', register);
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('add-task-form').addEventListener('submit', addTask);
}); 