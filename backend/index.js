const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize the Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://vineetdixit71:t4h5dM2Mpf40ijb7@clusterofflinesync.rp1zw.mongodb.net/offlineSyncUser?retryWrites=true&w=majority')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// MongoDB Schema and Model
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    age: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
}, { 
    timestamps: true, 
    collection: 'userdata' // Explicitly set collection name
});

const User = mongoose.model('userdata', UserSchema);

// CRUD Endpoints

// Create/Update (Sync-compatible)
app.post('/userdata', async (req, res) => {
    const { id, username, age, deleted } = req.body;

    try {
        if (id) {
            // Update if ID exists
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { username, age, deleted },
                { new: true }
            );
            return res.status(200).json(updatedUser);
        } else {
            // Create new record
            const newUser = new User({ username, age });
            await newUser.save();
            return res.status(201).json(newUser);
        }
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).json({ error: 'Failed to save user.' });
    }
});

// Read
app.get('/userdata', async (req, res) => {
    try {
        const users = await User.find({ deleted: false });
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// Delete (Soft Delete)
app.delete('/userdata/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndUpdate(id, { deleted: true }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.status(200).json(user);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user.' });
    }
});
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Sync Endpoint
// app.post('/sync', async (req, res) => {
//     console.log(req.body, "req body",res)
//     try {
        
//         // Default to the epoch if lastPulledAt is null
//         const lastPulledDate = req.body?.lastPulledAt ? new Date(req.body?.lastPulledAt) : new Date();

//         // Query for records updated since the last pulled date
//         const pulledUsers = await User.find({ updatedAt: { $gte: lastPulledDate } });

//         const createdUsers = pulledUsers.filter(user => user.createdAt >= lastPulledDate);
//         const updatedUsers = pulledUsers.filter(
//             user => user.updatedAt > lastPulledDate && user.createdAt < lastPulledDate
//         );
//         const deletedUsers = pulledUsers.filter(user => user.deleted);

//         res.status(200).json({
//             changes: {
//                 userdata: {
//                     created: createdUsers,
//                     updated: updatedUsers,
//                     deleted: deletedUsers.map(user => user._id),
//                 },
//             },
//             last_pulled_at: Date.now(), // Correctly sending Unix timestamp
//         });
//     } catch (error) {
//         console.error('Error in sync:', error);
//         res.status(500).json({ error: 'Failed to sync data.' });
//     }
// });

app.post('/sync', async (req, res) => {
    console.log('Request Body:', req.body);
    try {
        // Default to the epoch if lastPulledAt is null
        const lastPulledDate = req.body?.lastPulledAt
            ? new Date(req.body.lastPulledAt)
            : new Date(0); // Default to epoch for the first sync

        // Query for records updated since the last pulled date
        const pulledUsers = await User.find({ updatedAt: { $gte: lastPulledDate } });

        // Transform pulled records to match WatermelonDB schema
        const transformUser = (user) => ({
            id: user._id, // Map `_id` to `id` for WatermelonDB compatibility
            username: user.username,
            age: user.age,
            deleted: user.deleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });

        const createdUsers = pulledUsers
            .filter((user) => user.createdAt >= lastPulledDate)
            .map(transformUser);

            console.log(createdUsers,"createdUsers==-=-=")

        const updatedUsers = pulledUsers
            .filter((user) => user.updatedAt > lastPulledDate && user.createdAt < lastPulledDate)
            .map(transformUser);

        const deletedUsers = pulledUsers
            .filter((user) => user.deleted)
            .map((user) => user._id);

        // Send transformed response
        res.status(200).json({
            changes: {
                userdata: {
                    created: createdUsers,
                    updated: updatedUsers,
                    deleted: deletedUsers,
                },
            },
            last_pulled_at: Date.now(), // Correctly sending Unix timestamp
        });
    } catch (error) {
        console.error('Error in sync:', error);
        res.status(500).json({ error: 'Failed to sync data.' });
    }
});





// Start the Server
const PORT = 6000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
