const express = require('express');
const { getAllBooksController, addBookController, deleteBookController } = require('../controller/bookController');

const router = express.Router();

// GET /api/books/get-all-books?page=1&limit=10&orderBy=title&sortOrder=asc
router.get('/get-all-books', getAllBooksController);

// POST /api/books/add-book
router.post('/add-book', addBookController);

// DELETE /api/books/:id
router.delete('/:id', deleteBookController);

module.exports = router;