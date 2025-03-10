const express = require('express');
const { 
    addAuthorController, 
    deleteAuthorController, 
    getAllAuthorsController
} = require('../controller/authorController');

const router = express.Router();

// GET /api/authors?page=1&limit=10&orderBy=name&sortOrder=asc
router.get('/', getAllAuthorsController);

// POST /api/authors/add-author
router.post('/add-author', addAuthorController);

// DELETE /api/authors/:id
router.delete('/:id', deleteAuthorController);

module.exports = router;