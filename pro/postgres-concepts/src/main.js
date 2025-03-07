const { createUsersTable, insertUser, fetchAllUsers, updateUserEmail, deleteInfo } = require('./concepts/basic-queries');

// Test basic queries
async function testBasicQueries(){

    try {
        // await createUsersTable();

        // insert users
        // await insertUser('Arjun Sharma', 't2Hfd7@example.com');
        // await insertUser('John Doe', 'hMf9w@example.com');
        // await insertUser('Jane Doe', 'VXa8o@example.com');
        // await insertUser('Alice', 't2Hd7@example.com'); 

        // log all users
        // const allUsers = await fetchAllUsers();

        // update user email
        // const updatedUser = await updateUserEmail('Arjun Sharma', 'Arjun@example.com');
        // console.log('Updated User:', updatedUser);

        // delete user
        await deleteInfo('Arjun Sharma');

    } catch (error) {
        console.error('Error testing basic queries', error);
    }
}

async function testAllQueries(){
    await testBasicQueries();
}

testAllQueries();