const { 
    getUsersWhere, 
    getSortedUsers, 
    getPaginatedUsers 
} = require('./concepts/02filtering-sorting');

const { 
    createUsersTable,
    insertUser,
    fetchAllUsers,
    findUserByUsername,
    updateUserEmail,
    deleteUser
} = require('./concepts/01basic-queries');
const { createPostsTable, insertNewPost } = require('./concepts/03relationships');
const { getUsersWithPost, getAllUsersAndTheirPosts, findPostsByUsername, getUserPostStats } = require('./concepts/04joins');

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

// Function to run filter and sort queries
async function testFilterAndSortQueries(){
    
    try {
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
    } catch (error) {
        console.error('Filter and sort tests failed:', error.message);
    }
}

async function testRelationshipQuery(){
    try {
        // First create the tables
        await createUsersTable();
        await createPostsTable();
        console.log('----------');

        // Create test users first
        const user1 = await insertUser('blog_user1', 'blogger1@example.com');
        const user2 = await insertUser('blog_user2', 'blogger2@example.com');
        console.log('Test users created');
        console.log('----------');

        // Create multiple posts for each user
        console.log('Creating posts for users:');
        await insertNewPost("User1's First Post", "Content for first post", user1.id);
        await insertNewPost("User1's Second Post", "Content for second post", user1.id);
        await insertNewPost("User2's First Post", "Content from another user", user2.id);
        
        // Test foreign key constraint with non-existent user
        console.log('Testing foreign key constraint:');
        try {
            await insertNewPost("Invalid Post", "This should fail", 9999);
        } catch (error) {
            console.log('Successfully caught invalid user_id error');
        }

    } catch (error) {
        console.error('Relationship tests failed:', error.message);
    }
}

async function testJoinQuery(){
    try {
        console.log('Testing JOIN queries:');
        console.log('----------');

        // Test users with posts (INNER JOIN)
        // console.log('1. Users with posts (INNER JOIN):');
        // const usersWithPosts = await getUsersWithPost();
        // console.log(`Found ${usersWithPosts.length} users with posts`);
        // console.log('----------');

        // Test all users and their posts (LEFT JOIN)
        console.log('2. All users and their posts (LEFT JOIN):');
        const allUsersWithPosts = await getAllUsersAndTheirPosts();
        console.log(`Retrieved data for ${allUsersWithPosts.length} users`);
        console.log('----------');

        // Test user statistics
        // console.log('3. User post statistics:');
        // const userStats = await getUserPostStats();
        // console.log('User statistics retrieved', userStats);
        // console.log('----------');

        // // Test finding posts by username
        // console.log('4. Finding posts by username:');
        // const userPosts = await findPostsByUsername('blog_user1');
        // console.log(`Found ${userPosts.length} posts for blog_user1`);

    } catch (error) {
        console.error('Join query tests failed:', error.message);
    }
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
    // testQueries(),
    // testFilterAndSortQueries(),
    // testRelationshipQuery(),
    testJoinQuery()
   ])
   .finally(() => {
    setTimeout(() => process.exit(0), 1000);
   })
}

module.exports = { testQueries, testFilterAndSortQueries };