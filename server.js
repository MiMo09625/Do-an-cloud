const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

app.use(express.json());
app.use(cors()); 
app.use(express.static('public'));

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/evernote";
mongoose.connect(mongoURI).then(() => console.log('✅ Connected MongoDB'));

// 1. MODEL TÀI KHOẢN (Đã thêm trường email)
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, // <-- THÊM DÒNG NÀY
    password: { type: String, required: true },
    region: String
}));

// 2. MODEL GHI CHÚ
const Todo = mongoose.model('Todo', new mongoose.Schema({
    content: String,
    completed: Boolean,
    color: String,
    username: String 
}));

// --- API ĐĂNG KÝ / ĐĂNG NHẬP ---
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, region } = req.body;
        // Kiểm tra xem tên đăng nhập HOẶC email đã có ai dùng chưa
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ message: "Tên đăng nhập hoặc Email này đã có người sử dụng!" });
        
        const newUser = new User({ username, email, password, region });
        await newUser.save();
        res.json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server!" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username, password });
        if (!user) return res.status(400).json({ message: "Sai Tên đăng nhập hoặc Mật khẩu!" });
        
        res.json({ message: "Đăng nhập thành công!", username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Lỗi Server!" });
    }
});

// --- API GHI CHÚ ---
app.get('/api/todos/:username', async (req, res) => res.json(await Todo.find({ username: req.params.username })));
app.post('/api/todos', async (req, res) => res.json(await new Todo(req.body).save()));
app.put('/api/todos/:id', async (req, res) => res.json(await Todo.findByIdAndUpdate(req.params.id, req.body)));
app.delete('/api/todos/:id', async (req, res) => res.json(await Todo.findByIdAndDelete(req.params.id)));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
