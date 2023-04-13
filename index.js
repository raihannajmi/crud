const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const TodoTask = require('./models/TodoTask');

dotenv.config();

app.use('/static', express.static('public'));

app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

app.set('view engine', 'ejs');
async function getItems() {
  const items = await TodoTask.find({});
  return items;
}

app.get('/', async (req, res) => {
  getItems().then(function (FoundItems) {
    res.render('todo.ejs', { todoTasks: FoundItems });
  });
});

app.post('/', async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect('/');
  } catch (err) {
    res.redirect('/');
  }
});

app
  .route('/edit/:id')
  .get((req, res) => {
    const id = req.params.id;
    getItems().then(function (FoundItems) {
      res.render('todoEdit.ejs', { todoTasks: FoundItems, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;

    TodoTask.findByIdAndUpdate(id, { content: req.body.content })
      .then(res.redirect('/'))
      .catch((err) => {
        if (err) return res.send(500, err);
        res.redirect('/');
      });
  });

app.route('/remove/:id').get((req, res) => {
  const id = req.params.id;
  TodoTask.findByIdAndRemove(id)
    .then(res.redirect('/'))
    .catch((err) => {
      if (err) return res.send(500, err);
      res.redirect('/');
    });
});

app.listen(3001, () => {
  console.log('Server started and listening on port 3001!');
});
