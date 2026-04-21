const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Kết nối MongoDB Atlas (Dùng biến MONGO_URI Duy đã dán trên Render)
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/overnote"; 
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch(err => console.error('❌ Lỗi kết nối:', err));

// Định nghĩa khung dữ liệu cho Ghi chú
const TodoSchema = new mongoose.Schema({
    content: { type: String, required: true },
    completed: { type: Boolean, default: false }
});
const Todo = mongoose.model('Todo', TodoSchema);

// --- CÁC ĐƯỜNG DẪN API ---

// 1. Lấy danh sách ghi chú
app.get('/api/todos', async (req, res) => {
    const todos = await Todo.find();
    res.json(todos);
});

// 2. Thêm ghi chú mới
app.post('/api/todos', async (req, res) => {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.json(newTodo);
});

// 3. Cập nhật (Để lưu trạng thái Checkbox và nội dung)
app.put('/api/todos/:id', async (req, res) => {
    const updated = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});

// 4. Xóa ghi chú
app.delete('/api/todos/:id', async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy tại cổng: ${PORT}`));   