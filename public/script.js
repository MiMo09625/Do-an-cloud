let allTodos = []; // Lưu trữ để tìm kiếm nhanh

// FIX LỖI TÊN CÓ DẤU: Giải mã khi F5
function loadUserName() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawName = urlParams.get('name') || "L%C3%BD%20Di%E1%BB%87u%20Co"; 
    document.getElementById('userNameDisplay').innerText = decodeURIComponent(rawName);
}

async function loadData() {
    const res = await fetch('/api/todos');
    allTodos = await res.json();
    render(allTodos);
}

function render(todos) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    todos.forEach(item => {
        const li = document.createElement('li');
        // TÍNH NĂNG 3: MÀU SẮC GHI CHÚ
        li.style.backgroundColor = item.color; 
        li.className = item.completed ? 'completed' : '';
        li.innerHTML = `
            <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="saveCheck('${item._id}', this.checked)">
            <span style="flex:1; color: #333">${item.content}</span>
            <i class="fas fa-trash" style="color:#e74c3c; cursor:pointer" onclick="deleteItem('${item._id}')"></i>
        `;
        list.appendChild(li);
    });
}

// TÌM KIẾM NHANH (Frontend Filter)
function searchNotes() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allTodos.filter(t => t.content.toLowerCase().includes(term));
    render(filtered);
}

// TOGGLE DARK MODE
function toggleDarkMode() {
    const current = document.body.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', target);
    localStorage.setItem('theme', target);
}

async function addTodo() {
    const content = document.getElementById('todoInput').value;
    const color = document.getElementById('colorPicker').value;
    if (!content) return;
    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, color })
    });
    document.getElementById('todoInput').value = '';
    loadData();
}

// Sửa dấu huyền (backticks) cho fetch
async function saveCheck(id, status) {
    await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: status })
    });
    loadData();
}

async function deleteItem(id) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    loadData();
}

// AUTO SAVE 10S
setInterval(loadData, 10000);

// Khởi tạo
window.onload = () => {
    loadUserName();
    loadData();
    if(localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');
};
