const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==========================================
// 1. KẾT NỐI MONGODB TỰ ĐỘNG NHẬN DIỆN MÔI TRƯỜNG
// Nếu chạy trên Render, nó sẽ lấy process.env.MONGO_URI
// Nếu chạy ở máy tính, nó lấy localhost
// ==========================================
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/userDB';
mongoose.connect(mongoURI)
    .then(() => console.log('✅ Đã kết nối MongoDB thành công!'))
    .catch(err => console.log('❌ Lỗi kết nối DB:', err));

const userSchema = new mongoose.Schema({
    name: String, 
    email: { type: String, unique: true }, 
    password: String
});
const User = mongoose.model('User', userSchema);

const noteSchema = new mongoose.Schema({
    title: String, 
    content: String, 
    ownerEmail: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
    createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// ==========================================
// 2. MIDDLEWARE (BẢO VỆ ĐƯỜNG DẪN)
// ==========================================
const getEmailFromCookie = (req) => {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/userEmail=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
};

const requireLogin = (req, res, next) => {
    const email = getEmailFromCookie(req);
    if (email) next();
    else res.redirect('/');
};

// ==========================================
// 3. API TÀI KHOẢN & GIAO DIỆN
// ==========================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/home', requireLogin, (req, res) => res.sendFile(path.join(__dirname, 'public', 'home.html')));

app.post('/register', async (req, res) => {
    try {
        const newUser = new User({ name: req.body.name, email: req.body.email, password: req.body.password });
        await newUser.save();
        res.send('Đăng ký thành công! <a href="/">Đăng nhập ngay</a>');
    } catch (err) { res.status(400).send('Email đã tồn tại!'); }
});

app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) {
        res.cookie('userName', encodeURIComponent(user.name));
        res.cookie('userEmail', encodeURIComponent(user.email));
        res.redirect('/home');
    } else {
        res.send('Sai email hoặc mật khẩu! <a href="/">Thử lại</a>');
    }
});

app.post('/api/change-name', async (req, res) => {
    try {
        await User.findOneAndUpdate({ email: req.body.email }, { name: req.body.newName });
        res.cookie('userName', encodeURIComponent(req.body.newName)); 
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: "Lỗi đổi tên" }); }
});

app.get('/logout', (req, res) => {
    res.clearCookie('userName');
    res.clearCookie('userEmail');
    res.redirect('/');
});

// ==========================================
// 4. API GHI CHÚ (CRUD & DI CHUYỂN CÂY)
// ==========================================
app.get('/api/notes', async (req, res) => {
    const email = getEmailFromCookie(req);
    if (!email) return res.status(401).json([]);
    const notes = await Note.find({ ownerEmail: email }).sort({ createdAt: -1 });
    res.json(notes);
});

app.post('/api/notes', async (req, res) => {
    const email = getEmailFromCookie(req);
    if (!email) return res.status(401).send("Chưa đăng nhập");
    try {
        if (req.body.id) {
            const updatedNote = await Note.findOneAndUpdate(
                { _id: req.body.id, ownerEmail: email }, 
                { title: req.body.title, content: req.body.content }, 
                { new: true }
            );
            res.json(updatedNote);
        } else {
            const newNote = new Note({ title: req.body.title, content: req.body.content, ownerEmail: email });
            await newNote.save();
            res.json(newNote);
        }
    } catch (err) { res.status(500).send("Lỗi Cloud!"); }
});

app.post('/api/notes/move', async (req, res) => {
    const email = getEmailFromCookie(req);
    await Note.findOneAndUpdate(
        { _id: req.body.noteId, ownerEmail: email }, 
        { parentId: req.body.parentId || null }
    );
    res.json({ success: true });
});

app.delete('/api/notes/:id', async (req, res) => {
    const email = getEmailFromCookie(req);
    await Note.updateMany({ parentId: req.params.id }, { parentId: null });
    await Note.findOneAndDelete({ _id: req.params.id, ownerEmail: email });
    res.json({ success: true });
});

// ==========================================
// 5. KHỞI ĐỘNG SERVER (Hỗ trợ tự động nhận Port của Render)
// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại PORT: ${PORT}`);
});