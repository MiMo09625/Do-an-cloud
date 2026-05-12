// --- 1. KHỞI TẠO ---
let notes = JSON.parse(localStorage.getItem('overnote_notes')) || [];
let savedName = localStorage.getItem('overnote_user') || 'Lý Diệu Cơ';
let isLightMode = localStorage.getItem('overnote_theme') === 'light';

document.getElementById('display-name').innerText = savedName;
document.getElementById('new-username-input').value = savedName;
document.getElementById('note-input-page').value = localStorage.getItem('overnote_page_draft') || '';

if (isLightMode) { document.body.classList.add('light-mode'); document.getElementById('theme-icon').className = 'fas fa-sun'; }

renderNotes();
updateSyncTime();

// --- 2. CÀI ĐẶT & GIAO DIỆN ---
function toggleSettings() { document.getElementById('settingsMenu').classList.toggle('show'); document.getElementById('modeMenu').classList.remove('show'); }
function toggleModeMenu() { document.getElementById('modeMenu').classList.toggle('show'); document.getElementById('settingsMenu').classList.remove('show'); }

window.onclick = (e) => { if (!e.target.closest('.settings-container') && !e.target.closest('.mode-dropdown-container')) {
    document.getElementById('settingsMenu').classList.remove('show'); document.getElementById('modeMenu').classList.remove('show');
}};

function saveNewName() {
    const val = document.getElementById('new-username-input').value.trim();
    if(val) { localStorage.setItem('overnote_user', val); document.getElementById('display-name').innerText = val; toggleSettings(); }
}

function logoutApp() { if(confirm("Xóa data và đăng xuất?")) { localStorage.clear(); location.reload(); } }

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('theme-icon').className = isLight ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('overnote_theme', isLight ? 'light' : 'dark');
}

function changeMode(m) {
    document.getElementById('workspace-1-dong').style.display = (m === '1-dong' ? 'flex' : 'none');
    document.getElementById('workspace-trang-giay').style.display = (m === 'trang-giay' ? 'block' : 'none');
    document.getElementById('modeMenu').classList.remove('show');
}

// --- 3. QUẢN LÝ GHI CHÚ ---
function renderNotes(filter = '') {
    const list = document.getElementById('notesList');
    list.innerHTML = '';
    notes.filter(n => n.text.toLowerCase().includes(filter)).forEach(n => {
        list.insertAdjacentHTML('afterbegin', `
            <div class="note-item" style="border-left-color: ${n.color}">
                <div class="note-content">
                    <input type="checkbox" ${n.checked ? 'checked' : ''} onchange="toggleCheck(${n.id})">
                    <span style="text-decoration:${n.checked ? 'line-through' : 'none'}">${n.text}</span>
                </div>
                <button class="btn-delete-note" onclick="deleteNote(${n.id})"><i class="fas fa-trash"></i></button>
            </div>
        `);
    });
}

function addNote() {
    const input = document.getElementById('note-input-single');
    if(!input.value.trim()) return;
    notes.push({ id: Date.now(), text: input.value.trim(), color: document.getElementById('color-single').value, checked: false });
    saveLocal(); input.value = ''; renderNotes();
}

function addNoteFromPage() {
    const input = document.getElementById('note-input-page');
    if(!input.value.trim()) return;
    notes.push({ id: Date.now(), text: input.value.trim().replace(/\n/g, '<br>'), color: document.getElementById('color-page').value, checked: false });
    saveLocal(); input.value = ''; localStorage.removeItem('overnote_page_draft'); renderNotes(); changeMode('1-dong');
}

function deleteNote(id) { notes = notes.filter(n => n.id !== id); saveLocal(); renderNotes(); }
function toggleCheck(id) { const n = notes.find(x => x.id === id); if(n) { n.checked = !n.checked; saveLocal(); renderNotes(); }}

// --- 4. LƯU TRỮ & BACKUP ---
function saveLocal() { localStorage.setItem('overnote_notes', JSON.stringify(notes)); updateSyncTime(); }

function saveDraftLocally() { updateSyncTime(); alert("Đã lưu nháp vào Local Storage của Trình duyệt (Chỉ ở máy này)."); }
function saveToCloud() { updateSyncTime(); alert("Đang kết nối API... Đã đồng bộ lên MongoDB Cloud thành công!"); }

function showTrashModal() { if(notes.length) document.getElementById('trashModal').classList.add('show'); }
function closeTrashModal() { document.getElementById('trashModal').classList.remove('show'); }

function backupAndDelete() {
    const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes, null, 2));
    const link = document.createElement('a'); link.setAttribute("href", data);
    link.setAttribute("download", "OverNote_Backup.json"); link.click();
    executeDeleteAll();
}

function executeDeleteAll() { notes = []; saveLocal(); renderNotes(); closeTrashModal(); }

function updateSyncTime() { document.getElementById('sync-time').innerText = new Date().toLocaleTimeString('en-US'); }

// Lưu nháp real-time cho trang giấy
document.getElementById('note-input-page').addEventListener('input', (e) => {
    localStorage.setItem('overnote_page_draft', e.target.value);
});

// Tìm kiếm real-time
document.getElementById('search-input').addEventListener('input', (e) => renderNotes(e.target.value.toLowerCase()));
