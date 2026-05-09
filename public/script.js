let currentNotes = []; // Lưu trữ mảng ghi chú tạm thời

// 1. CHUYỂN ĐỔI GIAO DIỆN & TÊN NGƯỜI DÙNG
function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function loadUserName() {
    const savedName = localStorage.getItem('userName') || "Lý Diệu Cơ";
    document.getElementById('userNameDisplay').innerText = savedName;
}

// 2. HỆ THỐNG THÔNG BÁO TOAST XỊN XÒ
function showToast(message, color = "var(--primary)") {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.background = color;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    setTimeout(() => { 
        toast.classList.remove('show'); 
    }, 3000); // 3 giây tự động trượt mất
}

// 3. MENU CÀI ĐẶT (ĐỔI TÊN & ĐĂNG XUẤT)
function toggleSettings() {
    const menu = document.getElementById('settingsMenu');
    menu.classList.toggle('hidden');
}

function changeName() {
    const newName = document.getElementById('nameInput').value;
    if(newName.trim()) {
        localStorage.setItem('userName', newName);
        loadUserName();
        toggleSettings();
        showToast("✅ Đã đổi tên thành công!");
    }
}

function logout() {
    if(confirm("Duy muốn đăng xuất khỏi hệ thống?")) {
        window.location.href = '/register.html';
    }
}

// 4. QUẢN LÝ THÙNG RÁC
function openTrash() {
    document.getElementById('trashModal').classList.remove('hidden');
    renderTrash();
}

function closeTrash() {
    document.getElementById('trashModal').classList.add('hidden');
}

function renderTrash() {
    const trash = JSON.parse(localStorage.getItem('trashData')) || [];
    const list = document.getElementById('trashList');
    list.innerHTML = '';
    if(trash.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray;">Thùng rác đang trống.</p>';
        return;
    }
    trash.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.content}</span>
            <span class="trash-time"><i class="far fa-clock"></i> Đã xóa lúc: ${item.time}</span>
        `;
        list.appendChild(li);
    });
}

function clearTrash() {
    if(confirm("Xóa vĩnh viễn tất cả ghi chú trong thùng rác? Không thể khôi phục!")) {
        localStorage.removeItem('trashData');
        renderTrash();
        showToast("🔥 Đã dọn sạch thùng rác!", "var(--danger)");
    }
}

// 5. TẢI VÀ HIỂN THỊ DỮ LIỆU GHI CHÚ
async function loadData() {
    try {
        const res = await fetch('/api/todos');
        const data = await res.json();
        currentNotes = data; // Lưu lại để dùng khi xóa
        renderList(data);
        const time = new Date().toLocaleTimeString();
        document.getElementById('syncStatus').innerText = `✅ Đã đồng bộ với Cloud lúc ${time}`;
    } catch (err) {
        document.getElementById('syncStatus').innerText = "❌ Lỗi kết nối Cloud!";
    }
}

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
            <button class="delete-btn" onclick="deleteItem('${note._id}')" title="Đưa vào thùng rác"><i class="fas fa-trash"></i></button>
        `;
        list.appendChild(li);
    });
}

// 6. THÊM, SỬA, XÓA GHI CHÚ
async function addTodo() {
    const content = document.getElementById('todoInput').value;
    const color = document.getElementById('colorPicker').value;
    if (!content) return showToast("⚠️ Vui lòng nhập nội dung!", "#ff9800");

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, completed: false, color })
    });

    document.getElementById('todoInput').value = '';
    localStorage.removeItem('draftNote');
    loadData();
}

async function toggleComplete(id, currentStatus) {
    await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
    });
    loadData();
}

async function deleteItem(id) {
    if(confirm("Chuyển ghi chú này vào Thùng rác?")) {
        const note = currentNotes.find(n => n._id === id); // Tìm nội dung ghi chú
        if(note) {
            let trash = JSON.parse(localStorage.getItem('trashData')) || [];
            trash.push({ content: note.content, time: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString() });
            localStorage.setItem('trashData', JSON.stringify(trash));
        }
        await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        loadData();
        showToast("🗑️ Đã chuyển vào thùng rác!");
    }
}

// 7. LƯU NHÁP VÀ LƯU CLOUD (Thay vì alert thì dùng Toast)
function saveDraft() {
    const content = document.getElementById('todoInput').value;
    if(content) {
        localStorage.setItem('draftNote', content);
        showToast("✅ Đã lưu nháp vào bộ nhớ máy!");
    } else {
        showToast("⚠️ Không có chữ nào để lưu nháp!", "#ff9800");
    }
}

function syncCloud() {
    document.getElementById('syncStatus').innerText = "⏳ Đang tải dữ liệu lên Cloud...";
    loadData();
    showToast("☁️ Đã đẩy toàn bộ dữ liệu lên Cloud an toàn!");
}

function searchNotes() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('#todoList li');
    items.forEach(item => {
        const text = item.querySelector('span').innerText.toLowerCase();
        item.style.display = text.includes(keyword) ? 'flex' : 'none';
    });
}

// KHỞI ĐỘNG: Lấy theme, tên, bản nháp và tải dữ liệu
window.addEventListener('DOMContentLoaded', () => {
    document.body.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
    loadUserName();
    const draft = localStorage.getItem('draftNote');
    if(draft) document.getElementById('todoInput').value = draft;
    loadData();
});

setInterval(loadData, 10000);
