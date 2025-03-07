const { 
    createUsersTable,
    insertUser,
    fetchAllUsers,
    findUserByUsername,
    updateUserEmail,
    deleteUser
} = require('./concepts/basic-queries');

// Function to run all tests
async function testQueries() {
    try {
        // Create table if not exists
        await createUsersTable();
        console.log('----------');

        // Insert test users
        console.log('Testing user insertion:');
        const user1 = await insertUser('test_user1', 'test1@example.com');
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

        // Delete user
        console.log('Testing user deletion:');
        const deletedUser = await deleteUser('test_user1');
        console.log('Deleted user:', deletedUser);
        console.log('----------');

        // Verify deletion
        const checkUser = await findUserByUsername('test_user1');
        console.log('User after deletion:', checkUser);
        
        console.log('All tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

// Only run tests if this file is executed directly
if (require.main === module) {
    testQueries().finally(() => {
        // Force exit after tests complete
        setTimeout(() => process.exit(0), 1000);
    });
}

module.exports = { testQueries };