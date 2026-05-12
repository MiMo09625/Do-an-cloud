// --- CẬP NHẬT THỜI GIAN ---
function updateSyncTime() {
    const now = new Date();
    document.getElementById('sync-time').innerText = now.toLocaleTimeString('en-US');
}
setInterval(updateSyncTime, 1000);
updateSyncTime();

// --- MENU CHẾ ĐỘ XEM ---
function toggleMenu() {
    document.getElementById('modeMenu').classList.toggle('show');
}

// Đóng menu nếu click ra ngoài
window.onclick = function(event) {
    if (!event.target.matches('.btn-mode-toggle') && !event.target.matches('.fa-plus')) {
        let dropdowns = document.getElementsByClassName("mode-dropdown-menu");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// --- XỬ LÝ KHI CHỌN CHẾ ĐỘ ---
function changeMode(mode) {
    const noteInput = document.getElementById('note-input');
    const overlay = document.getElementById('overlay');

    // Reset class
    noteInput.className = '';

    if (mode === '1-dong') {
        noteInput.classList.add('mode-1-dong');
        overlay.classList.remove('active');
        noteInput.placeholder = "Nhập nội dung ghi chú...";
    } 
    else if (mode === 'trang-giay') {
        noteInput.classList.add('mode-trang-giay');
        overlay.classList.add('active');
        noteInput.placeholder = "Soạn thảo tài liệu chi tiết của bạn tại đây...";
    }
    else if (mode === 'tung-o') {
        noteInput.classList.add('mode-1-dong');
        overlay.classList.remove('active');
        alert("Tính năng hiển thị lưới (Từng ô) đang được phát triển!");
    }
}
