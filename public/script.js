// --- 1. KHỞI TẠO DỮ LIỆU ---
let notes = JSON.parse(localStorage.getItem('overnote_notes')) || [];
let savedName = localStorage.getItem('overnote_user') || 'Lý Diệu Cơ';
let isLightMode = localStorage.getItem('overnote_theme') === 'light';

document.getElementById('display-name').innerText = savedName;
document.getElementById('new-username-input').value = savedName; // Điền sẵn tên cũ vào Cài đặt
document.getElementById('note-input-page').value = localStorage.getItem('overnote_page_draft') || '';

if (isLightMode) {
    document.body.classList.add('light-mode');
    document.getElementById('theme-icon').className = 'fas fa-sun';
}

renderNotes();
updateSyncTime();

// --- Tự động lưu nháp & Tìm kiếm ---
document.getElementById('note-input-page').addEventListener('input', function() {
    localStorage.setItem('overnote_page_draft', this.value);
    updateSyncTime();
});
document.getElementById('search-input').addEventListener('input', function() {
    renderNotes(this.value.toLowerCase());
});

// --- 2. XỬ LÝ MENU & CÀI ĐẶT ---
function toggleModeMenu() {
    document.getElementById('modeMenu').classList.toggle('show');
    document.getElementById('settingsMenu').classList.remove('show'); // Đóng menu kia
}

function toggleSettings() {
    document.getElementById('settingsMenu').classList.toggle('show');
    document.getElementById('modeMenu').classList.remove('show'); // Đóng menu kia
}

// Đóng các menu nếu click ra ngoài
window.onclick = function(event) {
    if (!event.target.closest('.mode-dropdown-container') && !event.target.closest('.settings-container')) {
        document.getElementById('modeMenu').classList.remove('show');
        document.getElementById('settingsMenu').classList.remove('show');
    }
}

// Lưu tên mới từ Menu Cài Đặt
function saveNewName() {
    const newName = document.getElementById('new-username-input').value.trim();
    if(newName) {
        localStorage.setItem('overnote_user', newName);
        document.getElementById('display-name').innerText = newName;
        document.getElementById('settingsMenu').classList.remove('show');
    }
}

// Đăng xuất từ Menu Cài Đặt
function logoutApp() {
    if(confirm("Xóa toàn bộ bộ nhớ và đăng xuất?")) {
        localStorage.clear();
        location.reload(); 
    }
}

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
    document.getElementById('modeMenu').classList.remove('show');
}

// --- 3. QUẢN LÝ DANH SÁCH GHI CHÚ ---
function renderNotes(filterText = '') {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    
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
    const text = inputField.value.trim();
    if (text === '') return;
    notes.push({ id: Date.now(), text: text, color: document.getElementById('color-single').value, checked: false });
    saveNotesToLocal(); renderNotes(); inputField.value = ''; 
}

function addNoteFromPage() {
    const inputField = document.getElementById('note-input-page');
    const text = inputField.value.trim();
    if (text === '') return;
    const formattedText = text.replace(/\n/g, '<br>');
    notes.push({ id: Date.now(), text: formattedText, color: document.getElementById('color-page').value, checked: false });
    saveNotesToLocal(); renderNotes(); 
    inputField.value = ''; localStorage.removeItem('overnote_page_draft'); changeMode('1-dong'); 
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotesToLocal(); renderNotes();
}
function toggleCheck(id) {
    const note = notes.find(n => n.id === id);
    if (note) { note.checked = !note.checked; saveNotesToLocal(); renderNotes(); }
}

// --- 4. TÍNH NĂNG THÙNG RÁC & BACKUP (MỚI) ---
function showTrashModal() {
    if(notes.length === 0) return alert("Không có dữ liệu để xóa!");
    document.getElementById('trashModal').classList.add('show');
}
function closeTrashModal() {
    document.getElementById('trashModal').classList.remove('show');
}

// Hàm tải file Backup .json
function downloadBackupFile() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "OverNote_Backup_" + new Date().getTime() + ".json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function backupAndDelete() {
    downloadBackupFile(); // Tải file trước
    executeDeleteAll();   // Rồi mới xóa
}

function deleteWithoutBackup() {
    executeDeleteAll();   // Xóa luôn không tải file
}

function executeDeleteAll() {
    notes = [];
    saveNotesToLocal();
    renderNotes();
    closeTrashModal();
}

// --- 5. GIAO DIỆN KHÁC ---
function saveNotesToLocal() {
    localStorage.setItem('overnote_notes', JSON.stringify(notes));
    updateSyncTime();
}
function saveToCloud() {
    updateSyncTime();
    alert("Dữ liệu đã được lưu an toàn!");
}
function updateSyncTime() {
    document.getElementById('sync-time').innerText = new Date().toLocaleTimeString('en-US');
}
setInterval(updateSyncTime, 60000);
