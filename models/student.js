const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 60
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  }
});

// Handle duplicate email error
studentSchema.post('save', (error, doc, next) => {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email already exists'));
  } else {
    next();
  }
});

// Handle validation error
studentSchema.post('validate', (doc, next) => {
  const validationError = doc.validateSync();
  if (validationError) {
    next(new Error(validationError.message));
  } else {
    next();
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
