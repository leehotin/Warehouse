var express = require('express');
var router = express.Router();
const { ObjectId } = require('mongodb'); // Import ObjectId for querying by _id

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

router.get('/products_rec', async (req, res, next) => {
    try {
        const { _id } = req.query; // Extract _id from query parameters
        if (!_id) {
            res.status(400).send('Missing _id ');
            return;
        }

        const client = new MongoClient(mongoUrl, { useNewUrlParser: true });
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('products'); // Replace with your actual collection name

        // Fetch product data based on _id
        const product = await collection.findOne({ _id: ObjectId(_id) });

        if (!product) {
            res.status(404).send('Product not found');
            return;
        }

        // Send the product data as JSON
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).send('Internal server error');
    } finally {
        client.close(); // Close the MongoDB connection
    }
});

module.exports = router;
