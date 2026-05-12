// Cập nhật thời gian lúc mới mở web
document.getElementById('sync-time').innerText = new Date().toLocaleTimeString();

// Hàm chuyển đổi chế độ hiển thị
function toggleMode(mode) {
    const textarea = document.getElementById('note-content');
    const overlay = document.getElementById('overlay');

    if (mode === 'full-page') {
        // Chuyển sang Trang giấy to
        textarea.classList.remove('single-line');
        textarea.classList.add('full-page');
        
        // Hiện lớp phủ tối (Click vào lớp phủ sẽ tự đóng)
        overlay.classList.add('active');
        
        // Đổi placeholder cho phù hợp
        textarea.placeholder = "Bắt đầu soạn thảo tài liệu chi tiết của bạn tại đây...";
    } 
    else if (mode === 'single-line') {
        // Quay về chế độ 1 dòng
        textarea.classList.remove('full-page');
        textarea.classList.add('single-line');
        
        // Ẩn lớp phủ tối
        overlay.classList.remove('active');
        
        // Đổi lại placeholder
        textarea.placeholder = "Nhập nội dung ghi chú...";
    }
}
