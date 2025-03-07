const { getUsersWhere, getSortedUsers, getPaginatedUsers } = require('./concepts/02filtering-sorting');
const { 
    createUsersTable,
    insertUser,
    fetchAllUsers,
    findUserByUsername,
    updateUserEmail,
    deleteUser
} = require('./concepts/01basic-queries');

// Function to run all tests
async function testQueries() {
    try {
        // Create table if not exists
        await createUsersTable();
        console.log('----------');

        // Insert test users
        console.log('Testing user insertion:');
        // const user1 = await insertUser('ztest_user1', 'test1@example.com');
        const user1 = await insertUser('test_user2', 'test2@example.com');
        console.log('----------');
        
        // Find user by username
        console.log('Testing find user:');
        const foundUser = await findUserByUsername('test_user1');
        console.log('Found user:', foundUser);
        console.log('----------');

        // Update user email
        console.log('Testing email update:');
        const updatedUser = await updateUserEmail('test_user1', 'updated1@example.com');
        console.log('Updated user:', updatedUser);
        console.log('----------');

        // Fetch all users
        console.log('Testing fetch all users:');
        const allUsers = await fetchAllUsers();
        console.log(`Retrieved ${allUsers.length} users`);
        console.log('----------');

        // // Delete user
        // console.log('Testing user deletion:');
        // const deletedUser = await deleteUser('test_user1');
        // console.log('Deleted user:', deletedUser);
        // console.log('----------');

        // // Verify deletion
        // const checkUser = await findUserByUsername('test_user1');
        // console.log('User after deletion:', checkUser);
        
        console.log('All tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

async function testFilterAndSortQueries(){
    
    const filteredUsers = await getUsersWhere("username ILIKE 'Z%'");
    // LIKE is case-sensitive by default, use ILIKE for case-insensitive search
    console.log('Filtered users:', filteredUsers);

    const sortedUsers = await getSortedUsers('username', 'DESC');
    console.log('Sorted users:', sortedUsers);

    const paginatedUsers = await getPaginatedUsers(2, 1);
    /*
     -> limit = 2 → Fetch 2 users per page.
     -> offset = 1 → Skip the first user and start fetching from the second one.
    */
    console.log("Paginated Users", paginatedUsers);
}

// Only run tests if this file is executed directly
if (require.main === module) {
    /*
    testQueries().finally(() => {
        // Force exit after tests complete
        setTimeout(() => process.exit(0), 1000);
    });
    testFilterAndSortQueries().finally(() => {
        setTimeout(() => process.exit(0), 1000);
    }) -> Wrong approach
    */ 
   Promise.all([
    testQueries(),
    testFilterAndSortQueries()
   ])
   .finally(() => {
    setTimeout(() => process.exit(0), 1000);
   })
}

module.exports = { testQueries, testFilterAndSortQueries };