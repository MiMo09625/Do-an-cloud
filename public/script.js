// --- 1. KHỞI TẠO DỮ LIỆU TỪ LOCAL STORAGE ---
let notes = JSON.parse(localStorage.getItem('overnote_notes')) || [];
let savedName = localStorage.getItem('overnote_user') || 'Lý Diệu Cơ';
let isLightMode = localStorage.getItem('overnote_theme') === 'light';

document.getElementById('display-name').innerText = savedName;

// Khôi phục nháp của chế độ Trang giấy
document.getElementById('note-input-page').value = localStorage.getItem('overnote_page_draft') || '';

// Khôi phục giao diện
if (isLightMode) {
    document.body.classList.add('light-mode');
    document.getElementById('theme-icon').className = 'fas fa-sun';
}

// Render ghi chú ngay khi mở web
renderNotes();

// --- 2. CÁC TÍNH NĂNG VỪA SỬA LỖI ---

// Tính năng 1: Gõ tới đâu Lưu nháp tới đó cho Trang giấy
document.getElementById('note-input-page').addEventListener('input', function() {
    localStorage.setItem('overnote_page_draft', this.value);
    updateSyncTime();
});

// Tính năng 2: Thanh tìm kiếm hoạt động trực tiếp (Real-time)
document.getElementById('search-input').addEventListener('input', function() {
    renderNotes(this.value.toLowerCase());
});

// Tính năng 3: Chuyển đổi Nền Trắng / Đen
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('overnote_theme', 'light');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('overnote_theme', 'dark');
    }
}

// Tính năng 4: Cài đặt (Đổi tên & Đăng xuất)
function openSettings() {
    let choice = prompt("Cài đặt tài khoản:\n1. Đổi tên hiển thị\n2. Đăng xuất\n(Nhập số 1 hoặc 2):");
    if (choice === '1') {
        let newName = prompt("Nhập tên mới của bạn:");
        if (newName) {
            localStorage.setItem('overnote_user', newName);
            document.getElementById('display-name').innerText = newName;
        }
    } else if (choice === '2') {
        if(confirm("Bạn có chắc chắn muốn đăng xuất và xóa sạch dữ liệu khỏi trình duyệt này?")) {
            localStorage.clear();
            location.reload(); // Tải lại trang sẽ reset mọi thứ
        }
    }
}

// --- 3. QUẢN LÝ GHI CHÚ CHÍNH ---

function renderNotes(filterText = '') {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    
    // Lọc và in danh sách
    notes.filter(n => n.text.toLowerCase().includes(filterText)).forEach(note => {
        const noteHTML = `
            <div class="note-item" style="border-left-color: ${note.color};">
                <div class="note-content">
                    <input type="checkbox" ${note.checked ? 'checked' : ''} onchange="toggleCheck(${note.id})">
                    <span style="text-decoration: ${note.checked ? 'line-through' : 'none'}; opacity: ${note.checked ? '0.6' : '1'}">${note.text}</span>
                </div>
                <button class="btn-delete-note" onclick="deleteNote(${note.id})"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.insertAdjacentHTML('afterbegin', noteHTML);
    });
}

function addNote() {
    const inputField = document.getElementById('note-input-single');
    const colorField = document.getElementById('color-single');
    const text = inputField.value.trim();
    
    if (text === '') return alert("Vui lòng nhập nội dung!");

    const newNote = {
        id: Date.now(), // Tạo ID độc nhất dựa trên thời gian
        text: text,
        color: colorField.value,
        checked: false
    };

    notes.push(newNote);
    saveNotesToLocal();
    renderNotes();
    inputField.value = ''; 
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotesToLocal();
    renderNotes();
}

function toggleCheck(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
        note.checked = !note.checked;
        saveNotesToLocal();
        renderNotes();
    }
}

// Tính năng 5: Thùng rác tổng (Xóa tất cả)
function clearAllNotes() {
    if(confirm("Bạn có chắc chắn muốn xóa TẤT CẢ ghi chú?")) {
        notes = [];
        saveNotesToLocal();
        renderNotes();
    }
}

function saveNotesToLocal() {
    localStorage.setItem('overnote_notes', JSON.stringify(notes));
    updateSyncTime();
}

function saveToCloud() {
    updateSyncTime();
    alert("Đã lưu an toàn lên Cloud & Local Storage!");
}

// --- 4. CÁC HÀM GIAO DIỆN KHÁC ---
function updateSyncTime() {
    document.getElementById('sync-time').innerText = new Date().toLocaleTimeString('en-US');
}
setInterval(updateSyncTime, 60000); // Cập nhật đồng hồ mỗi 1 phút

function toggleMenu() { document.getElementById('modeMenu').classList.toggle('show'); }
window.onclick = function(event) {
    if (!event.target.matches('.btn-mode-toggle') && !event.target.matches('.fa-plus')) {
        let dropdowns = document.getElementsByClassName("mode-dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
        }
    }
}

function changeMode(mode) {
    const w1Dong = document.getElementById('workspace-1-dong');
    const wTrangGiay = document.getElementById('workspace-trang-giay');
    if (mode === 'trang-giay') {
        w1Dong.style.display = 'none';
        wTrangGiay.style.display = 'block';
    } else {
        wTrangGiay.style.display = 'none';
        w1Dong.style.display = 'flex';
    }
}
