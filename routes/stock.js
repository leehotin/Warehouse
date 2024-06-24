var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";

router.get('/', async (req, res, next) =>{
  try{
    await client.connect();
    let data = await client.db(dbName).collection("stocks").find().toArray();

    res.render('stock/index',{ datas: data });
  }finally{
    await client.close();
  }
});

// Route to get stock data
router.get('/info', async (req, res) => {
    try {
        await client.connect();

        // Retrieve stock data based on stockId
        const stockData = await client.db(dbName).collection('stocks').findOne({_id: req.query.stock_Id});
        // if (!stockData) {
        //     return res.status(404).json({ error: 'Stock not found' });
        //     }
        // Process stockData (e.g., display it or perform additional actions)
        // ..
     
        res.render('stock/enquiry', {stock_data: stockData});

        // Close the MongoDB connection
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    finally{
        await client.close(); 
    }
});

module.exports = router;
