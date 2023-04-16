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
      const books = await Book.find().sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        books
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
