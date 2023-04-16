require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

//models
const Book = require('./models/books');
const Student = require('./models/student');

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

// BASIC  [BOOKS]
router.route("/api/book")
.get(async (req, res) => {
    try {
      const { title, author } = req.query;
      let books;

      if (title && author) {
        // Search for books with a matching title and author
        books = await Book.find({
          $and: [
            { title: { $regex: title, $options: 'i' } },
            {
              $or: [
                { author: { $regex: author, $options: 'i' } },
                { author: { $exists: false } },
              ],
            },
          ],
        }).sort({ createdAt: -1 });

        // Check if the author matches the book title
        for (let book of books) {
          if (book.author.toLowerCase() !== author.toLowerCase()) {
            return res.status(400).json({ error: 'Author not found for this title' });
          }
        }
      } else if (title) {
        // Search for books with a matching title
        books = await Book.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
      } else if (author) {
        // Search for books with a matching author
        books = await Book.find({
          $or: [
            { author: { $regex: author, $options: 'i' } },
            { author: { $exists: false } },
          ],
        }).sort({ createdAt: -1 });
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

  // Update a book's details by ID
router.put('/api/book/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const book = await Book.findById(id);
  
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
  
      book.title = req.body.title || book.title;
      book.author = req.body.author || book.author;
      book.description = req.body.description || book.description;
      book.isbn = req.body.isbn || book.isbn;
      book.publishedDate = req.body.publishedDate || book.publishedDate;
      book.updatedAt = Date.now();
  
      const updatedBook = await book.save();
  
      return res.status(200).json({
        success: true,
        book: updatedBook,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.delete('/api/book/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const book = await Book.findByIdAndDelete(id);
      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

//INTERMIDIATE [STUDENT]

//middlewares
  const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };

//public route
router.post('/api/students', async (req, res) => {
    try {
      const { name, age, email } = req.body;
      
      // Validate input
      const student = new Student({ name, age, email });
      await student.validate();
      
      // Save student to database
      await student.save();
      
      return res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: student,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Error adding student',
        error: error.message,
      });
    }
  });

  // To get all students
  router.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      return res.status(200).json({
        success: true,
        students,
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
