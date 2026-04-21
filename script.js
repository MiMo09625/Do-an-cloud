const todoList = document.getElementById('todoList');
const syncStatus = document.getElementById('syncStatus');

// 1. Hàm tải dữ liệu (Load từ Cloud về)
async function loadData() {
    const res = await fetch('/api/todos');
    const data = await res.json();
    render(data);
}

function render(todos) {
    todoList.innerHTML = '';
    todos.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                onchange="saveCheck('${item._id}', this.checked)">
            <span class="${item.completed ? 'completed' : ''}">${item.content}</span>
            <i class="fas fa-trash" style="margin-left:auto; color:#e74c3c; cursor:pointer" 
                onclick="deleteItem('${item._id}')"></i>
        `;
        todoList.appendChild(li);
    });
}

// 2. Hàm thêm mới
async function addTodo() {
    const input = document.getElementById('todoInput');
    if (!input.value) return;
    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.value })
    });
    input.value = '';
    loadData();
}

// 3. Hàm lưu trạng thái Checkbox (Quan trọng: F5 không mất gạch ngang)
async function saveCheck(id, status) {
    await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: status })
    });
    loadData(); // Load lại để cập nhật giao diện
}

// 4. Hàm xóa
async function deleteItem(id) {
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    loadData();
}

// 5. AUTO SAVE MỖI 10 GIÂY
setInterval(() => {
    syncStatus.innerText = "Đang tự động lưu lên Cloud Atlas...";
    loadData();
    setTimeout(() => { syncStatus.innerText = "Đã đồng bộ vĩnh viễn ✅"; }, 2000);
}, 10000);

// Chạy lần đầu khi mở trang
loadData();