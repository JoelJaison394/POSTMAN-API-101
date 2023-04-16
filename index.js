require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const Book = require('./models/books');

const app = express();

const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.use(express.json());

const router = express.Router();

router.route("/api/book")
.get(async (req, res) => {
    try {
      const { title, author } = req.query;
      let books;

      if (title && author) {
        // Search for books with a matching title and author
        books = await Book.find({
          $or: [
            { title: { $regex: title, $options: 'i' } },
            { author: { $regex: author, $options: 'i' } },
          ],
        }).sort({ createdAt: -1 });
      } else if (title) {
        // Search for books with a matching title
        books = await Book.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
      } else if (author) {
        // Search for books with a matching author
        books = await Book.find({ author: { $regex: author, $options: 'i' } }).sort({ createdAt: -1 });
      } else {
        // Retrieve all books
        books = await Book.find().sort({ createdAt: -1 });
      }

      return res.status(200).json({
        success: true,
        books,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const newBook = await Book.create(req.body);

      return res.status(201)
        .location(`/api/book/${newBook._id}`)
        .json({
          success: true,
          newBook
        });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

app.use('/', router);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});
