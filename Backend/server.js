const express = require("express");
const fs = require("fs");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
app.use(cors());
// Middleware to parse incoming JSON payloads
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '..')));

// HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function readJSON(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    // 1. Check if the file exists before attempting to read
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found at path: ${filePath}. Returning empty array.`);
        return [];
    }
    // 2. Read and parse the file content
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`ERROR reading ${filename}:`, e.message);
    // Crucial: Return an empty array so the server doesn't crash
    return []; 
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(__dirname, filename);
  try {
    // ❗ FIX: The fs.writeFileSync needs a correct path and error handling.
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Successfully wrote data to ${filename}`);
  } catch (e) {
    // ❗ FIX: This will catch and log any file writing errors (like permission issues)
    console.error(`CRITICAL ERROR writing to ${filename}:`, e.message); 
    // If you see this error in your console, it's a file permission or path issue.
  }
}
// READ Route (existing)
app.get("/api/catfood", (req, res) => res.json(readJSON("catfood.json")));

// ❗ NEW: CREATE/ADD Route (using POST)
// server.js (Ensure this route is added)

// ❗ NEW: CREATE/ADD Route (using POST)
app.post("/api/catfood", (req, res) => {
  const newProductData = req.body;
  
  try {
    let products = readJSON("catfood.json");
    
    // 1. Generate a new unique ID (e.g., CF-5, CF-6, etc.)
    const maxIdNum = products.reduce((max, p) => {
      const match = p.id.match(/CF-(\d+)/);
      return match ? Math.max(max, parseInt(match[1])) : max;
    }, 0);
    const newId = `CF-${maxIdNum + 1}`;

    // 2. Create the new product object
    const newProduct = {
      id: newId,
      ...newProductData,
      stock: newProductData.stock === true 
    };

    // 3. Add the new product to the array
    products.push(newProduct);
    
    // 4. Save the entire updated array back to the file
    writeJSON("catfood.json", products);
    
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
// CREATE/ADD Route (using POST)
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
// ❗ DELETE Route to remove a product by ID
app.delete("/api/catfood/:id", (req, res) => {
  const productId = req.params.id;
  
  try {
    let products = readJSON("catfood.json");
    
    const initialLength = products.length;
    
    // Filter out the product with the matching ID
    products = products.filter(p => p.id !== productId);
    
    if (products.length === initialLength) {
      return res.status(404).json({ message: `Product ID ${productId} not found.` });
    }

    // Save the filtered (updated) array back to the file
    writeJSON("catfood.json", products); // Assuming you have a writeJSON helper
    
    res.status(200).json({ message: `Product ID ${productId} deleted successfully.` });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product due to server error." });
  }
});
const TYPE_PREFIX_MAP = {
  "Cat Food": "CF",
  "Dog Food": "DF",
  "Accessories": "AC",
  "Health Products": "HP"
};

// 1. CREATE Route (POST) - For adding new products with group IDs
app.post("/api/catfood", (req, res) => {
    const newProductData = req.body;
    
    try {
        let products = readJSON("catfood.json");
        
        // Determine the prefix based on the type sent from the frontend
        const productType = newProductData.type;
        const prefix = TYPE_PREFIX_MAP[productType];

        if (!prefix) {
            return res.status(400).json({ message: "Invalid product type specified." });
        }
        
        // Filter products to only count those in the current group
        const groupProducts = products.filter(p => p.id && p.id.startsWith(prefix + '-'));

        // Find the current highest ID number for this specific group
        const maxIdNum = groupProducts.reduce((max, p) => {
            const match = p.id.match(new RegExp(`^${prefix}-(\\d+)`));
            return match ? Math.max(max, parseInt(match[1])) : max;
        }, 0);

        const newId = `${prefix}-${maxIdNum + 1}`; // e.g., CF-1, DF-1
        
        // 2. Create the new product object
        const newProduct = {
            id: newId,
            type: productType, // ❗ Store the type
            ...newProductData,
            stock: newProductData.stock === true 
        };

        // 3. Add the new product and save
        products.push(newProduct);
        writeJSON("catfood.json", products);
        
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