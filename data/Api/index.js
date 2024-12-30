// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:5000', // Replace with your backend server URL
// });

// export const fetchItems = () => API.get('/items');
// export const createItem = (item) => API.post('/items', item);
// export const updateItem = (id, item) => API.put(`/items/${id}`, item);
// export const deleteItem = (id) => API.delete(`/items/${id}`);


// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// // Initialize app
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection
// const mongoURI = 'mongodb+srv://vineetdixit71:1TQkSbHzVXVt0Rci@offlinesynccluster.ltg76.mongodb.net/'; // Replace with your MongoDB URI
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;

// db.on('connected', () => console.log('Connected to MongoDB'));
// db.on('error', (err) => console.error('MongoDB connection error:', err));

// // Define a Mongoose schema
// const ItemSchema = new mongoose.Schema({
//   name: { type: String, required: true },
// });

// const Item = mongoose.model('Item', ItemSchema);

// // Routes
// // Create
// app.post('/items', async (req, res) => {
//     console.log(req,"reqqqq")
//   try {
//     const newItem = new Item(req.body);
//     await newItem.save();
//     res.status(201).json(newItem);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to create item' });
//   }
// });

// // Read
// app.get('/items', async (req, res) => {
//   try {
//     const items = await Item.find();
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch items' });
//   }
// });

// // Update
// app.put('/items/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });
//     res.json(updatedItem);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to update item' });
//   }
// });

// // Delete
// app.delete('/items/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Item.findByIdAndDelete(id);
//     res.status(204).end();
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete item' });
//   }
// });

// // Start server
// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
