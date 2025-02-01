const express = require('express');
// import { Router } from 'express';
// const router = Router();
const { asyncHandler, APIError } = require('../middleware/errorHandler');

const router = express.Router();

const items = [
    {
        id: 1,
        name: 'Item 1'
    },
    {
        id: 2,
        name: 'Item 2'
    },
    {
        id: 3,
        name: 'Item 3'
    },
    {
        id: 4,
        name: 'Item 4'
    }
];

router.get('/items', asyncHandler(async (req, res) => {
    // console.log("inside")
    res.json(items);
}));

router.post('/items', asyncHandler(async (req, res) => {
    if(!req.body.name){
        throw new APIError('Name is required', 400);
    }
    const newItems ={
        id: items.length + 1,
        name: req.body.name
    }

    items.push(newItems);
    res.status(201).json(newItems);
}))

module.exports = router;