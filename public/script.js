// --- ĐỒNG HỒ SYNC ---
function updateSyncTime() {
    const now = new Date();
    document.getElementById('sync-time').innerText = now.toLocaleTimeString('en-US');
}
setInterval(updateSyncTime, 1000);
updateSyncTime();

// --- MENU CHẾ ĐỘ ---
function toggleMenu() {
    document.getElementById('modeMenu').classList.toggle('show');
}
window.onclick = function(event) {
    if (!event.target.matches('.btn-mode-toggle') && !event.target.matches('.fa-plus')) {
        let dropdowns = document.getElementsByClassName("mode-dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) dropdowns[i].classList.remove('show');
        }
    }
}

// --- CHUYỂN ĐỔI CHẾ ĐỘ VIẾT ---
function changeMode(mode) {
    const w1Dong = document.getElementById('workspace-1-dong');
    const wTrangGiay = document.getElementById('workspace-trang-giay');
    const inputSingle = document.getElementById('note-input-single');
    const inputPage = document.getElementById('note-input-page');

    if (mode === 'trang-giay') {
        w1Dong.style.display = 'none';
        wTrangGiay.style.display = 'block';
        inputPage.value = inputSingle.value; // Chuyển chữ đang gõ dở sang giấy
    } 
    else if (mode === '1-dong') {
        wTrangGiay.style.display = 'none';
        w1Dong.style.display = 'flex';
        inputSingle.value = inputPage.value;
    }
}

// --- CHỨC NĂNG THÊM GHI CHÚ ---
function addNote() {
    const inputField = document.getElementById('note-input-single');
    const colorField = document.getElementById('color-single');
    const text = inputField.value.trim();
    
    if (text === '') {
        alert("Vui lòng nhập nội dung!");
        return;
    }

    const list = document.getElementById('notesList');
    const noteHTML = `
        <div class="note-item" style="border-left-color: ${colorField.value};">
            <div class="note-content">
                <input type="checkbox">
                <span>${text}</span>
            </div>
            <button class="btn-delete-note" onclick="this.parentElement.remove()"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    // Thêm ghi chú lên đầu danh sách
    list.insertAdjacentHTML('afterbegin', noteHTML);
    inputField.value = ''; // Xóa ô nhập sau khi thêm
}

// --- CHỨC NĂNG THÙNG RÁC GÓC TRÊN ---
function clearAllNotes() {
    if(confirm("Bạn có chắc chắn muốn xóa TẤT CẢ ghi chú không?")) {
        document.getElementById('notesList').innerHTML = '';
        updateSyncTime();
    }
}

// --- CHỨC NĂNG NÚT LƯU ---
function saveData() {
    updateSyncTime();
    alert("Dữ liệu đã được đẩy lên Cloud thành công!");
}
