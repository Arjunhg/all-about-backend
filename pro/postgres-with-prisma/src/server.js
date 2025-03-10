require('dotenv').config();
const express = require('express');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
app.use(express.json());

app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);

app.use((error, req, res, next) => {
    console.error(error.stack); 
    const statusCode = error.message.toLowerCase().includes("not found") ? 404 : 
                      error.message.toLowerCase().includes("invalid") ? 400 : 500; 

    res.status(statusCode).json({
        error: error.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})

