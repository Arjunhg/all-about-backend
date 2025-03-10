const { addBook, getAllBook, deleteBook } = require("../services/bookService");

exports.addBookController = async(req, res, next) => {
    try {
        const { title, publishedDate, authorId } = req.body;
        const book = await addBook(title, publishedDate, authorId);
        res.status(201).json({
            message: 'Book added successfully',
            book
        })
    } catch (error) {
        next(error);
    }
}

exports.getAllBooksController = async(req,res,next) => {
    try {
        const { orderBy, sortOrder, page, limit } = req.query;
        const options = {
            orderBy: orderBy || 'title',
            sortOrder: sortOrder || 'asc',
            /*
            page: isNaN(parseInt(page)) ? 1 : parseInt(page),
            limit: isNaN(parseInt(limit)) ? 10 : parseInt(limit)
            */
            page: Number(page) || 1,
            limit: Number(limit) || 10
        };
        const result = await getAllBook(options);
        res.status(200).json(result);
    } catch (error) {
        /*
        const statusCode = error.message.toLowerCase().includes("not found") ? 404 : 400;
        res.status(statusCode).json({
            error: error.message
        })
        */
       next(error);
    }
}

exports.deleteBookController = async(req, res, next) => {
    try {
        const parsedId = Number(req.params.id);
        if(!Number.isInteger(parsedId) || parsedId<=0){
            /*
            return res.status(400).json({
                error: 'Invalid id format. ID must be a positive integer'
            })
            */
            return next(new Error('Invalid id format. ID must be a positive integer'));    
        }
        const deletedBook = await deleteBook(parsedId);
        res.status(200).json({
            message: 'Book deleted successfully',
            deletedBook
        })
    } catch (error) {
        console.error('Error deleting book:', error.message);
        next(error);
    }
}