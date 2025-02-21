import express from "express";
import data from "./data/Data.js";

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Use environment variable for port with a fallback to 8000 for flexibility in production
const PORT = process.env.PORT || 8000;

// Basic route for testing the server
app.get('/', (req, res) => {
    res.status(200).send("Hello World!");
});

// GET /api/v1/users: Retrieve all users or filter by name via query parameter
app.get('/api/v1/users', (req, res) => {
    const { name } = req.query; // e.g., /api/v1/users?name=John
    
    if (name) {
        // Filter users by name (case-sensitive; adjust to toLowerCase() if case-insensitive is needed)
        const users = data.filter(user => user.name === name); 
        // Use filter when you want multiple results. It returns an array of all elements that satisfy the condition.
        // If no element satisfies the condition, it returns an empty array.

        if (users.length === 0) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }
        return res.status(200).json(users);
    }

    // Return all users if no query parameter is provided
    res.status(200).json(data);
});

// GET /api/v1/users/:id: Retrieve a single user by ID
app.get('/api/v1/users/:id', (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id);

    // Validate that ID is a valid number
    if (isNaN(parsedId)) {
        return res.status(400).json({ message: "Invalid ID" });
    }

    // Find user by ID; assumes IDs are unique
    const user = data.find(user => user.id === parsedId); 
    // Use find when you want only one result. It returns the first element that satisfies the condition.
    // If no element satisfies the condition, it returns undefined.

    if (!user) {
        return res.status(404).json({ message: "User Not Found" });
    }

    res.status(200).json(user);
});

// POST /api/v1/users: Create a new user
app.post('/api/v1/users', (req, res) => {
    const { name, displayName } = req.body;

    // Validate required fields
    if (!name || !displayName) {
        return res.status(400).json({ message: "Name and displayName are required" });
    }

    const newUser = {
        id: data.length + 1, // Simple ID generation; consider UUIDs in real production
        name,
        displayName
    };

    data.push(newUser);

    // 201 Created is appropriate for resource creation
    res.status(201).json({
        message: "User Created Successfully",
        data: newUser
    });
});

// PUT /api/v1/users/:id: Update an existing user
app.put('/api/v1/users/:id', (req, res) => {
    const { id } = req.params;
    const parsedId = parseInt(id);

    // Validate that ID is a valid number
    if (isNaN(parsedId)) {
        return res.status(400).json({ message: "Invalid ID" });
    }

    const userIndex = data.findIndex(user => user.id === parsedId);

    if (userIndex === -1) {
        return res.status(404).json({ message: "User Not Found" });
    }

    // Only update allowed fields (name and displayName) to prevent overwriting id or adding new fields
    const { name, displayName } = req.body;
    if (name) data[userIndex].name = name;
    if (displayName) data[userIndex].displayName = displayName;

    /*
        -data[userIndex] = { ...data[userIndex], ...body }
        - Allowed any field in the body to overwrite or add to the user object, including id
        - Current approach ensures only name and displayName are updated
        - Example:
            Existing user:
            {
                "id": 1,
                "name": "John",
                "displayName": "Johnny"
            }
            PUT /api/v1/users/1
            Content-Type: application/json
            {
                "name": "Johnny",
                "extraField": "ignored"
            }
            Output:
            {
                "message": "User Updated Successfully",
                "data": {
                    "id": 1,
                    "name": "Johnny",
                    "displayName": "Johnny"
                }
            }
    */

    res.status(200).json({
        message: "User Updated Successfully",
        data: data[userIndex]
    });
});

/*
    Spread operator notes:
    - { ...obj1, ...obj2 } = Merges obj1 and obj2, with obj2 overwriting duplicate keys.
    - { ...obj1, obj2 } = Keeps obj1's properties, but adds obj2 as a nested object under the key 'obj2'.
*/

// Global error handler to catch unhandled errors (e.g., invalid JSON in request body)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
// Corrected callback signature from (req, res) => to () =>
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});