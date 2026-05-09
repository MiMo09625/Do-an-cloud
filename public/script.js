function loadUserName() {
    // Tìm xem tài khoản này đã tự đổi tên hiển thị chưa, nếu chưa thì gán mặc định là "New Users"
    const displayName = localStorage.getItem('displayName_' + getUser()) || "New Users";
    document.getElementById('userNameDisplay').innerText = displayName;
}

function changeName() {
    const newName = document.getElementById('nameInput').value;
    if(newName.trim()) {
        // Cập nhật tên mới riêng cho tài khoản đang dùng
        localStorage.setItem('displayName_' + getUser(), newName);
        loadUserName();
        toggleSettings();
        showToast("✅ Đã đổi tên hiển thị thành công!");
    }
}
