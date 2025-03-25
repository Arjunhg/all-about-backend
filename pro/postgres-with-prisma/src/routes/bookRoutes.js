const express = require('express');
const { getAllBooksController, addBookController, deleteBookController } = require('../controller/bookController');
const { metrics } = require('../metrics/metrics');

const router = express.Router();

// GET /api/books/get-all-books?page=1&limit=10&orderBy=title&sortOrder=asc
router.get('/get-all-books', getAllBooksController);

// POST /api/books/add-book
router.post('/add-book', (req, res, next) => {
    res.on('finish', () => {
        if(res.statusCode >= 200 && res.statusCode < 300){
            metrics.bookCreatedCounter.inc();
        }
    })
    addBookController(req, res, next);
});

// DELETE /api/books/:id
router.delete('/:id', deleteBookController);

module.exports = router;