const { PrismaClient, Prisma } = require('@prisma/client');
const { trackDbQuery } = require('../metrics/metrics');

const prisma = new PrismaClient();

function validateAuthorInput(name){
    if(!name || typeof name != 'string' || name.trim().length === 0){
        throw new Error('Invalid name: Name must be a non-empty string');
    }
}

const addAuthor = trackDbQuery("INSERT", "author", async function addAuthor(name){
    try {
        
        validateAuthorInput(name);

        return await prisma.$transaction(async (tx) => {
            const existingUser = await tx.author.findFirst({
                // findUnique only works with fields that have a unique constraint (like id).
                where: {
                    name: {
                        equals: name, mode: 'insensitive'
                    }
                }
            })

            if(existingUser){
                throw new Error('Author already exists');
            }

            return await tx.author.create({
                data: {
                    name: name.trim()
                },
                include: {
                    books: true
                }
            })
        })
    } catch (error) {
        console.error('Error adding author:', error.message);
        throw error;
    }
})

const getAllAuthors = trackDbQuery("SELECT", "author", async function getAllAuthors(options = {}){
    try {
        const { orderBy='name', sortOrder='asc', page=1, limit=10 } = options;

        const sortedOrder = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);

        const validOrderFields = ['name', 'id'];
        if(!validOrderFields.includes(orderBy)){
            throw new Error(`Invalid orderBy field: ${orderBy}. Valid fields are ${validOrderFields.join(', ')}`);
        }

        const skip = (pageNumber-1) * limitNumber;

        const [total, authors] = await prisma.$transaction([
            prisma.author.count(),
            prisma.author.findMany({
                include: {
                    books: true
                },
                orderBy: {
                    [orderBy]: sortedOrder
                },
                skip,
                take: limitNumber
            })
        ])

        return {
            authors,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total/limitNumber)
            }
        }

    } catch (error) {
        console.error('Error getting authors:', error.message);
        throw error;
    }
})

const deleteAuthor = trackDbQuery("DELETE", "author", async function deleteAuthor(id){
    try {

        return await prisma.$transaction(async(tx) => {
            const author = await tx.author.findUnique({
                where: {
                    id
                },
                /*
                include: {
                    books: true
                }
                    -> We don't need to include books here because we are checking if the author has any books.
                */
               select: {
                    books: {
                        select: {
                            id: true //fetch only book id
                        }
                    }
               }

            })
            if(!author) throw new Error('Author not found');
            if(author.books.length > 0) throw new Error('Cannot delete author with existing books');

            return await tx.author.delete({
                where: {
                    id
                }
            })
        })
    } catch (error) {
        console.error('Error deleting author:', error.message);
        throw error;
    }
}
)

let isDisconnecting = false;

async function disconnectingPrisma(){
    if(!isDisconnecting){
        isDisconnecting = true;
        try {
            await prisma.$disconnect();
            console.log('Prisma client disconnected');
        } catch (error) {
            console.error('Error disconnecting Prisma client:', error.message);
            process.exit(1);
        }
    }
}

process.on('beforeExit', disconnectingPrisma);
process.on('SIGINT', disconnectingPrisma);
process.on('SIGTERM', disconnectingPrisma);
process.on('uncaughtException', async(err) => {
    console.error('Uncaught exception:', err);
    await disconnectingPrisma();
    process.exit(1);
})


module.exports = { addAuthor, getAllAuthors, deleteAuthor };