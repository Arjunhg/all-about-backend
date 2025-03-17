const express = require('express');
const { 
    addAuthorController, 
    deleteAuthorController, 
    getAllAuthorsController
} = require('../controller/authorController');
const { metrics } = require('../metrics/metrics');

const router = express.Router();

// GET /api/authors/get-all-authors?page=1&limit=10&orderBy=name&sortOrder=asc
router.get('/get-all-authors', getAllAuthorsController);

// POST /api/authors/add-author
// Wrap controller in metrics middleware to track request metrics
router.post('/add-author', (req, res, next) => {

    res.on('finish', () => { //✅ Runs after response is fully sent
        if(res.statusCode >= 200 && res.statusCode < 300){
            metrics.authorCreatedCounter.inc();
        }
    })

    addAuthorController(req, res, next);// ✅ Runs first
});

// DELETE /api/authors/:id
router.delete('/:id', deleteAuthorController);

module.exports = router;