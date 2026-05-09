const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

app.use(express.json());
app.use(cors()); 
app.use(express.static('public'));

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/evernote";
mongoose.connect(mongoURI).then(() => console.log('✅ Connected MongoDB'));

const Todo = mongoose.model('Todo', new mongoose.Schema({
    content: String,
    completed: Boolean,
    color: String
}));

app.get('/api/todos', async (req, res) => res.json(await Todo.find()));
app.post('/api/todos', async (req, res) => res.json(await new Todo(req.body).save()));
app.put('/api/todos/:id', async (req, res) => res.json(await Todo.findByIdAndUpdate(req.params.id, req.body)));
app.delete('/api/todos/:id', async (req, res) => res.json(await Todo.findByIdAndDelete(req.params.id)));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));
