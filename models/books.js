const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the book.'],
    trim: true,
  },
  author: {
    type: String,
    required: [true, 'Please provide an author for the book.'],
    trim: true,
  },
  genre: {
    type: String,
    required: [true, 'Please provide a genre for the book.'],
    trim: true,
  },
  publishedDate: {
    type: Date,
    required: [true, 'Please provide a published date for the book.'],
  },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
