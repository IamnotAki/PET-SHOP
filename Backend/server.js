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

// ✅ NEW: File Constants declared once at the top
const CATFOOD_FILE = "catfood.json";
const USERS_FILE = "user.json"; 

// Helper function to read JSON data from a file
function readJSON(filename) {
  try {
    const filePath = path.join(__dirname, filename);
    // Check if file exists, if not, return empty array for safety
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    // If the file is empty, return an empty array
    if (!data.trim()) {
        return [];
    }
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    // Return empty array on read/parse error
    return [];
  }
}

// Function to write JSON data to a file
function writeJSON(filename, data) {
  // Use 'null, 2' for pretty printing (optional but helpful)
  fs.writeFileSync(path.join(__dirname, filename), JSON.stringify(data, null, 2), 'utf8');
}


// ===================================
// 🌐 AUTHENTICATION ROUTES
// ===================================

// ❗ NEW: SIGNUP ROUTE
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    let users = readJSON(USERS_FILE);

    // Check for existing user
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Add new user
    const newUser = { name, email, password };
    users.push(newUser);
    writeJSON(USERS_FILE, users);

    res.status(201).json({ message: "Sign up successful!", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup." });
  }
});

// ❗ NEW: LOGIN ROUTE
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    let users = readJSON(USERS_FILE);

    // Ensure the default admin exists for initial setup
    const adminEmail = 'admin@animalandia.com';
    const hasAdmin = users.some(u => u.email === adminEmail);
    if (!hasAdmin) {
        users.push({ email: adminEmail, password: 'Admin123', name: 'Admin' });
        writeJSON(USERS_FILE, users);
    }
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Return a basic user object (excluding password for security)
      const loggedInUser = { name: user.name, email: user.email, isAdmin: user.email === adminEmail };
      res.status(200).json({ message: "Login successful!", user: loggedInUser });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
});


// ===================================
// 🛒 PRODUCT (CATFOOD) ROUTES
// ===================================

// READ Route (existing)
app.get("/api/catfood", (req, res) => res.json(readJSON(CATFOOD_FILE)));

// ❗ NEW: CREATE/ADD Route (using POST)
app.post("/api/catfood", (req, res) => {
  const newProduct = req.body; // Product data from client
  
  // Basic validation
  if (!newProduct.brand || !newProduct.name || typeof newProduct.price === 'undefined') {
    return res.status(400).json({ message: "Missing required product fields (brand, name, price)." });
  }
  
  try {
    let products = readJSON(CATFOOD_FILE);
    
    // Generate a simple unique ID (e.g., CF-5, CF-6, etc.)
    const maxIdNum = products.reduce((max, p) => {
        const idNum = parseInt(p.id.split('-')[1]) || 0;
        return Math.max(max, idNum);
    }, 0);
    newProduct.id = `CF-${maxIdNum + 1}`;

    // Add stock/desc if missing
    newProduct.stock = newProduct.stock === 'true' || newProduct.stock === true;
    newProduct.desc = newProduct.desc || "No description provided.";

    products.push(newProduct);
    
    // Save the entire updated array back to the file
    writeJSON(CATFOOD_FILE, products);
    
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

// ❗ UPDATE Route to modify an existing product by ID
app.put("/api/catfood/:id", (req, res) => {
  const productId = req.params.id;
  const updatedData = req.body;
  
  try {
    let products = readJSON(CATFOOD_FILE);
    const index = products.findIndex(p => p.id === productId);
    
    if (index === -1) {
      return res.status(404).json({ message: `Product ID ${productId} not found.` });
    }
    
    // Update product fields
    products[index] = { ...products[index], ...updatedData };
    
    // Ensure stock is boolean
    if (typeof products[index].stock === 'string') {
        products[index].stock = products[index].stock === 'true';
    }

    writeJSON(CATFOOD_FILE, products);
    
    res.status(200).json({ 
      message: `Product ID ${productId} updated successfully.`, 
      product: products[index] 
    });

  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product due to server error." });
  }
});

// ❗ DELETE Route to remove a product by ID
app.delete("/api/catfood/:id", (req, res) => {
  const productId = req.params.id;
  
  try {
    let products = readJSON(CATFOOD_FILE);
    
    const initialLength = products.length;
    
    // Filter out the product with the matching ID
    products = products.filter(p => p.id !== productId);
    
    if (products.length === initialLength) {
      return res.status(404).json({ message: `Product ID ${productId} not found.` });
    }

    // Save the filtered (updated) array back to the file
    writeJSON(CATFOOD_FILE, products);
    
    res.status(200).json({ message: `Product ID ${productId} deleted successfully.` });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product due to server error." });
  }
});

server.listen(3000, () => console.log("Backend + WS running on http://localhost:3000"));