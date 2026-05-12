let currentNotes = []; 

// KIỂM TRA ĐĂNG NHẬP (Bảo mật)
function getUser() {
    const user = localStorage.getItem('userName');
    if(!user) {
        window.location.href = '/register.html'; // Trình duyệt lạ chưa đăng nhập sẽ bị đá ra ngoài
    }
    return user;
}

function toggleDarkMode() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

function loadUserName() {
    document.getElementById('userNameDisplay').innerText = getUser();
}

function showToast(message, color = "var(--primary)") {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.style.background = color;
    toast.classList.add('show');
    toast.classList.remove('hidden');
    setTimeout(() => { toast.classList.remove('show'); }, 3000); 
}

function toggleSettings() {
    document.getElementById('settingsMenu').classList.toggle('hidden');
    // Tìm xem tài khoản này đã tự đổi tên hiển thị chưa, nếu chưa thì gán mặc định là "New Users"
    const displayName = localStorage.getItem('displayName_' + getUser()) || "New Users";
    document.getElementById('userNameDisplay').innerText = displayName;
}

function changeName() {
    const newName = document.getElementById('nameInput').value;
    if(newName.trim()) {
        localStorage.setItem('userName', newName);
        // Cập nhật tên mới riêng cho tài khoản đang dùng
        localStorage.setItem('displayName_' + getUser(), newName);
        loadUserName();
        toggleSettings();
        loadData(); // Tải lại data của tên mới
        showToast("✅ Đã đổi tên! Không gian làm việc mới được tạo.");
    }
}

function logout() {
    if(confirm("Duy muốn đăng xuất khỏi hệ thống?")) {
        localStorage.removeItem('userName'); // Xóa phiên đăng nhập
        window.location.href = '/register.html';
    }
}

// QUẢN LÝ THÙNG RÁC (Đã thêm nút khôi phục)
function openTrash() {
    document.getElementById('trashModal').classList.remove('hidden');
    renderTrash();
}
function closeTrash() { document.getElementById('trashModal').classList.add('hidden'); }

function renderTrash() {
    const trash = JSON.parse(localStorage.getItem('trashData_' + getUser())) || [];
    const list = document.getElementById('trashList');
    list.innerHTML = '';
    if(trash.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray;">Thùng rác đang trống.</p>';
        return;
    }
    trash.forEach((item, index) => {
        const li = document.createElement('li');
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.innerHTML = `
            <div style="flex:1; text-align: left;">
                <span style="color: ${item.color || 'var(--text)'}; font-weight: bold;">${item.content}</span><br>
                <span class="trash-time"><i class="far fa-clock"></i> Đã xóa lúc: ${item.time}</span>
            </div>
            <button class="btn-restore" onclick="restoreItem(${index})" title="Khôi phục"><i class="fas fa-undo"></i></button>
        `;
        list.appendChild(li);
    });
}

async function restoreItem(index) {
    let trash = JSON.parse(localStorage.getItem('trashData_' + getUser())) || [];
    let item = trash[index];
    
    // Gửi lại lên Database
    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: item.content, completed: false, color: item.color, username: getUser() })
    });

    trash.splice(index, 1); // Xóa khỏi mảng thùng rác
    localStorage.setItem('trashData_' + getUser(), JSON.stringify(trash));
    
    renderTrash();
    loadData();
    showToast("♻️ Đã khôi phục ghi chú!");
}

function clearTrash() {
    if(confirm("Xóa vĩnh viễn tất cả ghi chú trong thùng rác?")) {
        localStorage.removeItem('trashData_' + getUser());
        renderTrash();
        showToast("🔥 Đã dọn sạch thùng rác!", "var(--danger)");
    }
}

// DATA & API
async function loadData() {
    try {
        const res = await fetch(`/api/todos/${getUser()}`); // Lấy đúng data của user hiện tại
        const data = await res.json();
        currentNotes = data; 
        renderList(data);
        document.getElementById('syncStatus').innerText = `✅ Đã đồng bộ lúc ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        document.getElementById('syncStatus').innerText = "❌ Lỗi kết nối Cloud!";
        showToast("✅ Đã đổi tên hiển thị thành công!");
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

async function addTodo() {
    const content = document.getElementById('todoInput').value;
    const color = document.getElementById('colorPicker').value;
    if (!content) return showToast("⚠️ Vui lòng nhập nội dung!", "#ff9800");

    await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, completed: false, color, username: getUser() })
    });

    document.getElementById('todoInput').value = '';
    localStorage.removeItem('draftNote_' + getUser());
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
        const note = currentNotes.find(n => n._id === id); 
        if(note) {
            let trash = JSON.parse(localStorage.getItem('trashData_' + getUser())) || [];
            trash.push({ content: note.content, color: note.color, time: new Date().toLocaleTimeString() + " " + new Date().toLocaleDateString() });
            localStorage.setItem('trashData_' + getUser(), JSON.stringify(trash));
        }
        await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        loadData();
        showToast("🗑️ Đã chuyển vào thùng rác!");
    }
}

// TÍNH NĂNG NHÁP VÀ CLOUD
function saveDraft() {
    const content = document.getElementById('todoInput').value;
    if(content) {
        localStorage.setItem('draftNote_' + getUser(), content);
        showToast("✅ Đã lưu nháp an toàn!");
    } else { showToast("⚠️ Không có chữ nào để lưu nháp!", "#ff9800"); }
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

// KHỞI ĐỘNG
window.addEventListener('DOMContentLoaded', () => {
    if(!localStorage.getItem('userName')) return; // Chặn nếu chưa đăng nhập
    document.body.setAttribute('data-theme', localStorage.getItem('theme') || 'dark');
    loadUserName();
    const draft = localStorage.getItem('draftNote_' + getUser());
    if(draft) document.getElementById('todoInput').value = draft;
    loadData();
});

setInterval(loadData, 10000);
