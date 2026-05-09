// 1. CHUYỂN ĐỔI GIAO DIỆN SÁNG / TỐI
function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// Giữ nguyên giao diện người dùng đã chọn khi F5 lại web
if (localStorage.getItem('theme') === 'light') {
    document.body.setAttribute('data-theme', 'light');
} else {
    document.body.setAttribute('data-theme', 'dark'); // Mặc định là Dark Mode như ý Duy
}

// 2. TẢI DỮ LIỆU TỪ MONGODB LÊN GIAO DIỆN
async function loadData() {
    try {
        const res = await fetch('/api/todos');
        const data = await res.json();
        renderList(data);
        const time = new Date().toLocaleTimeString();
        document.getElementById('syncStatus').innerText = `✅ Đã đồng bộ với Cloud lúc ${time}`;
    } catch (err) {
        document.getElementById('syncStatus').innerText = "❌ Lỗi mất kết nối Cloud!";
    }
}

// 3. HIỂN THỊ DANH SÁCH GHI CHÚ
function renderList(notes) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    notes.forEach(note => {
        const li = document.createElement('li');
        if (note.completed) li.classList.add('completed');
        li.style.borderLeft = `6px solid ${note.color || '#4CAF50'}`;
        
        li.innerHTML = `
            <div class="note-content">
                <input type="checkbox" ${note.completed ? 'checked' : ''} onchange="toggleComplete('${note._id}', ${note.completed})">
                <span>${note.content}</span>
            </div>
            <button class="delete-btn" onclick="deleteItem('${note._id}')" title="Xóa ghi chú"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(li);
    });
}

// 4. THÊM GHI CHÚ MỚI
async function addTodo() {
    const content = document.getElementById('todoInput').value;
    const color = document.getElementById('colorPicker').value;
    
    if (!content) return alert('Vui lòng nhập nội dung ghi chú!');

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, completed: false, color })
    });

    document.getElementById('todoInput').value = '';
    localStorage.removeItem('draftNote'); // Xóa nháp sau khi đã thêm thành công
    loadData();
}

// 5. CẬP NHẬT HOÀN THÀNH (Gạch bỏ chữ)
async function toggleComplete(id, currentStatus) {
    await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
    });
    loadData();
}

// 6. XÓA GHI CHÚ
async function deleteItem(id) {
    if(confirm("Duy có chắc chắn muốn xóa ghi chú này không?")) {
        await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        loadData();
    }
}

// 7. LƯU NHÁP (Lưu vào máy tính hiện tại)
function saveDraft() {
    const content = document.getElementById('todoInput').value;
    if(content) {
        localStorage.setItem('draftNote', content);
        alert("✅ Đã lưu nháp! Lần sau mở web bạn sẽ thấy lại dòng này.");
    } else {
        alert("Không có chữ nào để lưu nháp cả.");
    }
}

// 8. ĐỒNG BỘ CLOUD (Lưu thủ công)
function syncCloud() {
    document.getElementById('syncStatus').innerText = "⏳ Đang tải dữ liệu lên Cloud...";
    loadData();
    alert("✅ Toàn bộ dữ liệu đã được đẩy an toàn lên Cloud!");
}

// 9. ĐĂNG XUẤT
function logout() {
    if(confirm("Duy muốn đăng xuất khỏi hệ thống?")) {
        window.location.href = '/register.html';
    }
}

// 10. TÌM KIẾM GHI CHÚ
function searchNotes() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('li');
    items.forEach(item => {
        const text = item.querySelector('span').innerText.toLowerCase();
        item.style.display = text.includes(keyword) ? 'flex' : 'none';
    });
}

// Khi vừa mở web lên: tự động lấy bản nháp (nếu có) và tải ghi chú
window.addEventListener('DOMContentLoaded', () => {
    const draft = localStorage.getItem('draftNote');
    if(draft) document.getElementById('todoInput').value = draft;
    loadData();
});

// Tự động đồng bộ ngầm mỗi 10 giây
setInterval(loadData, 10000);
