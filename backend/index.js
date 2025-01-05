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
    _id:{ type: String, required: true },
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




// app.post('/sync', async (req, res) => {
//     console.log('Request Body:', req.body);
//     try {
//         // Default to the epoch if lastPulledAt is null
//         const lastPulledDate = req.body?.lastPulledAt
//             ? new Date(req.body.lastPulledAt)
//             : new Date(0); // Default to epoch for the first sync

//         // Query for records updated since the last pulled date
//         const pulledUsers = await User.find({ updatedAt: { $gte: lastPulledDate } });

//         // Transform pulled records to match WatermelonDB schema
//         const transformUser = (user) => ({
//             id: user._id, // Map `_id` to `id` for WatermelonDB compatibility
//             username: user.username,
//             age: user.age,
//             deleted: user.deleted,
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt,
//         });

//         const createdUsers = pulledUsers
//             .filter((user) => user.createdAt >= lastPulledDate)
//             .map(transformUser);

//             console.log(createdUsers,"createdUsers==-=-=")

//         const updatedUsers = pulledUsers
//             .filter((user) => user.updatedAt > lastPulledDate && user.createdAt < lastPulledDate)
//             .map(transformUser);

//         const deletedUsers = pulledUsers
//             .filter((user) => user.deleted)
//             .map((user) => user._id);

//         // Send transformed response
//         res.status(200).json({
//             changes: {
//                 userdata: {
//                     created: createdUsers,
//                     updated: updatedUsers,
//                     deleted: deletedUsers,
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
        const { lastPulledAt, changes } = req.body;

        // Handle push changes (saving data to MongoDB)
        if (changes && changes.userdata) {
            const { created, updated, deleted } = changes.userdata;

            // Handle created records
            if (created && created.length > 0) {
                await User.insertMany(
                    created.map((user) => ({
                        _id: user.id, // Use the ID provided by WatermelonDB
                        username: user.username,
                        age: user.age,
                        deleted: user.deleted || false,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    }))
                );
            }

            // Handle updated records
            if (updated && updated.length > 0) {
                for (const user of updated) {
                    await User.findByIdAndUpdate(
                        user.id,
                        {
                            username: user.username,
                            age: user.age,
                            deleted: user.deleted || false,
                            updatedAt: user.updatedAt,
                        },
                        { new: true } // Return the updated document
                    );
                }
            }

            // Handle deleted records (soft delete)
            if (deleted && deleted.length > 0) {
                for (const userId of deleted) {
                    await User.findByIdAndUpdate(userId, { deleted: true }, { new: true });
                }
            }
        }

        // Handle pull changes (fetching data for WatermelonDB)
        const lastPulledDate = lastPulledAt ? new Date(lastPulledAt) : new Date();
        const pulledUsers = await User.find({ updatedAt: { $gte: lastPulledDate } });

        const transformUser = (user) => ({
            id: user._id, // Map `_id` to `id`
            username: user.username,
            age: user.age,
            deleted: user.deleted,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });

        const createdUsers = pulledUsers
            .filter((user) => {
                console.log(user,"user==-=-=")
                return user.createdAt >= lastPulledDate})
            .map(transformUser);

        const updatedUsers = pulledUsers
            .filter((user) => user.updatedAt > lastPulledDate && user.createdAt < lastPulledDate)
            .map(transformUser);

        const deletedUsers = pulledUsers.filter((user) => user.deleted).map((user) => user._id);

        // Send the response
        res.status(200).json({
            changes: {
                userdata: {
                    created: createdUsers,
                    updated: updatedUsers,
                    deleted: deletedUsers,
                },
            },
            last_pulled_at: Date.now(), // Current timestamp for the last sync
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
