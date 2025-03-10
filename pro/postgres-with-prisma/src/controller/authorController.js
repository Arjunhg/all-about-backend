const { addAuthor, getAllAuthors, deleteAuthor } = require("../services/authorService");

exports.addAuthorController = async (req, res, next) => {
    try {
        const {name} = req.body;
        const author = await addAuthor(name);
        res.status(201).json({
            message: 'Author added successfully',
            author
        })
        /*
            {
                "message": "Author added successfully",
                "author": {
                    "id": 1,
                    "name": "John Doe",
                    "books": [
                    { "id": 101, "title": "Book 1", "publishedDate": "2024-01-01" },
                    { "id": 102, "title": "Book 2", "publishedDate": "2024-02-01" }
                    ]
                }
            }
                -> data.author.name
                -> data.author.books (if .length>0)

        */               
    } catch (error) {
        next(error);
    }
}

exports.getAllAuthorsController = async(req, res, next) => {  // Changed from getAllAuthorController
    try {
        const { orderBy, sortOrder, page, limit } = req.query;
        const options = {
            orderBy: orderBy || 'name',
            sortOrder: sortOrder || 'asc',
            /*
            page: isNaN(parseInt(page)) ? 1 : parseInt(page),
            limit: isNaN(parseInt(limit)) ? 10 : parseInt(limit)
            */
            page: Number(page) || 1,
            limit: Number(limit) || 10
        }
        const result = await getAllAuthors(options);
        res.status(200).json(result);
        /*
        {
            "authors": [
                { "id": 1, "name": "John Doe", "books": [] },
                { "id": 2, "name": "Jane Doe", "books": [{ "id": 101, "title": "Book 1" }] }
            ],
            "pagination": {
                "total": 20,
                "page": 1,
                "limit": 10,
                "totalPages": 2
            }
        }

        */
    } catch (error) {
        next(error);
    }
}

exports.deleteAuthorController = async(req, res, next) => {
    try {
        const parsedId = Number(req.params.id);
        if(!Number.isInteger(parsedId) || parsedId<=0){
            return res.status(400).json({
                error: 'Invalid id format. ID must be a positive integer'
            })
        }
        const deletedAuthor = await deleteAuthor(parsedId);
        res.status(200).json({
            message: 'Author deleted successfully',
            deletedAuthor
        })
    } catch (error) {
        next(error);
        // 404 - Author not found
        // 400 - Bad request
    }
}
