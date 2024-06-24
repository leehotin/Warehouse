var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb://localhost:27017/");

const pdf = require('pdfkit'); // Install this package using npm install pdfkit

// Assuming your MongoDB database name is "Warehouse_In_Out_System"
const dbName = "Warehouse_In_Out_System";
const collectionName = "stock"; // Use the actual collection name

// Middleware to handle form submissions
router.use(express.urlencoded({ extended: true }));

// Route for stock listing by area (PDF format)
router.get('/stock-listing/:area', function(req, res, next) {
  const area = req.params.area; // Get the area from the URL parameter
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Fetch stock records by warehouse area
  collection.find({ warehouse_location: area }).toArray((err, stocks) => {
    if (err) {
      console.error("Error fetching stock data:", err);
      res.status(500).send("Error fetching stock data");
    } else {
      // Create a new PDF document
      const doc = new pdf();
      doc.pipe(res); // Send the PDF as the response

      // Set up page numbering
      const itemsPerPage = 50;
      const totalPages = Math.ceil(stocks.length / itemsPerPage);

      // Add content to the PDF
      doc.fontSize(16).text("Stock Listing", { align: 'center' });
      doc.moveDown();
      doc.text(`Printing Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
      doc.text(`Printing Time: ${new Date().toLocaleTimeString()}`, { align: 'right' });

      // Generate stock listing
      for (let page = 1; page <= totalPages; page++) {
        doc.addPage();
        doc.text(`Page ${page} of ${totalPages}`, { align: 'right' });

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, stocks.length);
        for (let i = startIndex; i < endIndex; i++) {
          const stock = stocks[i];
          doc.text(`Stock ID: ${stock.stock_id}, Name: ${stock.stock_name}, Location: ${stock.warehouse_location}`);
        }
      }

      doc.end(); // Finalize the PDF
    }
  });
});

// Route for exporting stock listing to CSV (for Excel)
router.get('/stock-listing-csv/:area', function(req, res, next) {
  const area = req.params.area; // Get the area from the URL parameter
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  // Fetch stock records by warehouse area
  collection.find({ warehouse_location: area }).toArray((err, stocks) => {
    if (err) {
      console.error("Error fetching stock data:", err);
      res.status(500).send("Error fetching stock data");
    } else {
      // Generate CSV content
      const csvContent = stocks.map(stock => `${stock.stock_id},${stock.stock_name},${stock.warehouse_location}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="stock_listing.csv"');
      res.send(csvContent);
    }
  });
});

// Close the MongoDB connection when the server shuts down
process.on('SIGINT', () => {
  client.close();
  console.log("MongoDB connection closed.");
  process.exit();
});

…
module.exports = router;
