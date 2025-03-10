const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Validates book input data
 * @param {string} title - Book title
 * @param {Date} publishedDate - Publication date
 * @param {number} authorId - Author ID
 * @throws {Error} If validation fails
 */
function validateBookInput(title, publishedDate, authorId) {
    if (!title || typeof title !== 'string') {
        throw new Error('Invalid title: Title must be a non-empty string');
    }
    if (publishedDate && !(publishedDate instanceof Date) && isNaN(new Date(publishedDate))) {
        throw new Error('Invalid published date format');
    }
    if (!authorId || typeof authorId !== 'number') {
        throw new Error('Invalid authorId: Author ID must be a number');
    }
}

async function addBook(title, publishedDate, authorId) {
    try {
        validateBookInput(title, publishedDate, authorId);

        return await prisma.$transaction(async (tx) => { //tx acts as transaction client
            /*
            The benefits of this approach are:
                Atomicity: All operations within the transaction either succeed together or fail together. If any operation fails, all changes are rolled back.
                Isolation: Other database operations can't see the partial results of your transaction until it completes.
                Consistency: Your database remains in a consistent state because related operations are grouped together.
            */
            // Check if author exists and not duplicate book
            const existingBook = await tx.book.findFirst({
                where: {
                    title, authorId
                }
            })
            if(existingBook){
                throw new Error('Book already exists');
            }
            const authorExists = await tx.author.findUnique({
                where: { id: authorId }
            });
            
            if (!authorExists) {
                throw new Error(`Author with ID ${authorId} not found`);
            }

            const formattedDate = new Date(publishedDate).toISOString();

            return await tx.book.create({
                data: {
                    title,
                    publishedDate: formattedDate,
                    author: {
                        connect: { id: authorId }
                    },
                },
                include: {
                    author: true
                }
            });
        });
    } catch (error) {
        console.error('Error adding book:', error.message);
        throw error;
    }
}

async function getAllBook(options = {}) {
    try {
        const { orderBy = 'title', sortOrder = 'asc', page = 1, limit = 10 } = options;

        const validOrderFields = ['id', 'title', 'publisedDate'];
        if(!validOrderFields.includes(orderBy)){
            throw new Error(`Invalid orderBy field: ${orderBy}. Valid fields are ${validOrderFields.join(', ')}`);
        }

        const sortedOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);
        
        const skip = (pageNumber - 1) * limitNumber;
        const [total, books] = await prisma.$transaction([
            prisma.book.count(),
            prisma.book.findMany({ //returns array
                include: {
                    author: true
                },
                orderBy: {
                    [orderBy]: sortedOrder
                },
                skip,
                take: limit
            })
        ]);

        return {
            books,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        };
    } catch (error) {
        console.error('Error getting books:', error.message);
        throw error;
    }
}

async function getBookById(id) {
    try {
        if (!id || typeof id !== 'number') {
            throw new Error('Invalid book ID');
        }

        const book = await prisma.book.findUnique({
            where: { id },
            include: {
                author: true
            }
        });

        if (!book) {
            throw new Error(`Book with ID ${id} not found`);
        }

        return book;
    } catch (error) {
        console.error('Error getting book by id:', error.message);
        throw error;
    }
}

async function updateBook({id, newTitle, newPublishedDate}){
    try {
          /*
        const updatedBook = await prisma.book.update({
            where: {
                id
            },
            data: {
                title: newTitle,
                publishedDate: new Date(newPublishedDate),
            },
            include: {
                author: true
            }
        })
        */

        return await prisma.$transaction(async (prisma) => {
            // check if book exists
            const book = await prisma.book.findUnique({
                where: {
                    id
                }
            })
            if(!book) throw new Error('Book not found');

            //contruct update data dynamically
            const updateData = {};
            if(newTitle) updateData.title = title;
            if(newPublishedDate) updateData.publishedDate = new Date(newPublishedDate);

            // perform update
            return await prisma.book.update({
                where: {
                    id
                },
                data: updateData,
                include: {
                    author: true
                }
            })
        })

          /*
        🚀 Direct Update vs Transaction-Based Update Comparison
        +---------------+------------------------------------------------+------------------------------------------------+
        | Aspect        | Direct Update                                   | Transaction-Based Update                        |
        +---------------+------------------------------------------------+------------------------------------------------+
        | Atomicity     | Non-atomic - partial updates possible           | Fully atomic - all operations succeed or roll   |
        |               | with multiple queries                           | back as one unit                                |
        +---------------+------------------------------------------------+------------------------------------------------+
        | Consistency   | Partial updates may persist if errors occur     | Maintains data consistency through rollbacks    |
        +---------------+------------------------------------------------+------------------------------------------------+
        | Performance   | Better for single-query operations              | Slight overhead due to transaction management   |
        +---------------+------------------------------------------------+------------------------------------------------+
        | Flexibility   | Single operation only                           | Supports multiple operations in one transaction |
        +---------------+------------------------------------------------+------------------------------------------------+
        | Error Handling| Requires explicit handling for missing records  | Built-in handling within transaction scope      |
        +---------------+------------------------------------------------+------------------------------------------------+
        */

    } catch (error) {
        console.error('Error updating book', error);
        throw error;
    }
}

async function deleteBook(id) {
    try {
        return await prisma.$transaction(async (tx) => {
            const book = await tx.book.findUnique({
                where: { id }
            });

            if (!book) {
                throw new Error(`Book with ID ${id} not found`);
            }

            return await tx.book.delete({
                where: { id },
                include: {
                    author: true
                }
            });
        });
    } catch (error) {
        console.error('Error deleting book:', error.message);
        throw error;
    }
}

// Cache the Prisma instance cleanup for process termination
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = {
    addBook,
    getAllBook,
    getBookById,
    updateBook,
    deleteBook
};
