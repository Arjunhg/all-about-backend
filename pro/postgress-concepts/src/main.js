const { createUsersTable } = require('./concepts/basic-queries');

// Test basic queries
async function testBasicQueries(){

    try {
        await createUsersTable();
    } catch (error) {
        console.error('Error testing basic queries', error);
    }
}

async function testAllQueries(){
    await testBasicQueries();
}

testAllQueries();