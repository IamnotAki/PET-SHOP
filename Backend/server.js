// server.js (MODIFIED)

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
app.use(cors());
// ❗ NEW: Middleware to parse incoming JSON payloads
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '..')));

// HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function readJSON(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, filename), 'utf8'));
}

// ❗ NEW: Function to write JSON data to a file
function writeJSON(filename, data) {
  // Use 'null, 2' for pretty printing (optional but helpful)
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2), 'utf8');
}


// READ Route (existing)
app.get("/api/catfood", (req, res) => res.json(readJSON("catfood.json")));

// ❗ NEW: CREATE/ADD Route (using POST)
app.post("/api/catfood", (req, res) => {
  const newProductData = req.body;
  
  try {
    let products = readJSON("catfood.json");
    
    // 1. Generate a new unique ID
    // Find the current highest ID number (e.g., from CF-99)
    const maxIdNum = products.reduce((max, p) => {
      const match = p.id.match(/CF-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const newId = `CF-${maxIdNum + 1}`;

    // 2. Create the new product object
    const newProduct = {
      id: newId,
      ...newProductData,
      // Ensure 'stock' is a boolean, as expected by the JSON file
      stock: newProductData.stock === true 
    };

    // 3. Add the new product to the array
    products.push(newProduct);
    
    // 4. Save the entire updated array back to the file
    writeJSON("catfood.json", products);
    
    // Respond with the newly created product
    res.status(201).json({ 
      message: "Product created successfully", 
      product: newProduct 
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product due to server error." });
  }
});

// ... (existing server.listen)

// ❗ NEW: UPDATE/EDIT Route (using PUT)
app.put("/api/catfood/:id", (req, res) => {
  const productId = req.params.id;
  const updatedProductData = req.body;
  
  try {
    let products = readJSON("catfood.json");
    
    // Find the index of the product to update
    const index = products.findIndex(p => p.id === productId);

    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product, keeping the old ID
    products[index] = { ...products[index], ...updatedProductData, id: productId };
    
    // Save the entire updated array back to the file
    writeJSON("catfood.json", products);
    
    // Respond with the updated product
    res.json({ message: "Product updated successfully", product: products[index] });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product due to server error." });
  }
});
// ❗ NEW: CREATE/ADD Route (using POST)
app.post("/api/catfood", (req, res) => {
  const newProductData = req.body;
  
  try {
    let products = readJSON("catfood.json");
    
    // 1. Generate a new unique ID
    // Find the current highest ID number (e.g., from CF-99)
    const maxIdNum = products.reduce((max, p) => {
      const match = p.id.match(/CF-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const newId = `CF-${maxIdNum + 1}`;

    // 2. Create the new product object
    const newProduct = {
      id: newId,
      ...newProductData,
      // Ensure 'stock' is a boolean, as expected by the JSON file
      stock: newProductData.stock === true 
    };

    // 3. Add the new product to the array
    products.push(newProduct);
    
    // 4. Save the entire updated array back to the file
    writeJSON("catfood.json", products);
    
    // Respond with the newly created product
    res.status(201).json({ 
      message: "Product created successfully", 
      product: newProduct 
    });

  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Failed to create product due to server error." });
  }
});


server.listen(3000, () => console.log("Backend + WS running on http://localhost:3000"));