// admin.js (MODIFIED)


 //  ADMIN DASHBOARD JS — NOW API-ENABLED


// Base URL for the API server (IMPORTANT: Use the full URL)
const API_URL = "http://localhost:3000";

let currentEditingProduct = null; // To hold the product data currently being edited

// =======================
// 🔸 LOAD USERS (STATIC DEMO)
// (No change needed here, still uses localStorage)
// =======================
function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [
    { id: 1, name: "John Doe", email: "john@gmail.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@gmail.com", status: "Blocked" }
  ];

  localStorage.setItem("users", JSON.stringify(users)); // persist demo users
  const table = document.querySelector("#userTable tbody");
  table.innerHTML = "";

  users.forEach(u => {
    table.innerHTML += `
      <tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.status}</td>
        <td>
          <button class="action-btn edit-btn" onclick="toggleStatus(${u.id})">Toggle</button>
        </td>
      </tr>
    `;
  });
}

function toggleStatus(id) {
  // ... (original function)
  const users = JSON.parse(localStorage.getItem("users"));
  const user = users.find(u => u.id === id);
  if(user){
    user.status = user.status === "Active" ? "Blocked" : "Active";
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
}

// =======================
// 🔸 UTILITIES
// =======================
function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

function openAddProduct() {
  document.getElementById("modalTitle").textContent = "Add Product";
  document.getElementById("brand").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("stock").value = "true";
  currentEditingProduct = null; // No product to edit
  document.getElementById("productModal").style.display = "flex";
}

// ❗ NEW: OPEN EDIT PRODUCT - Fetches data from the table row
function openEditProduct(productId) {
  const table = document.querySelector("#productTable tbody");
  // Find the product in the table to populate the form (since we don't have a local array anymore)
  const row = Array.from(table.rows).find(r => r.cells[0].textContent === productId);
  
  if (!row) return alert("Product data not found in table.");

  // Get data from row cells
  const data = {
    id: row.cells[0].textContent,
    brand: row.cells[1].textContent,
    name: row.cells[2].textContent,
    price: parseFloat(row.cells[3].textContent.replace('₱', '')),
    // The image src in the cell is in an <img> tag, so we need to extract the src
    img: row.cells[5].querySelector('img').src.split('/').pop(), // Get just the filename
    stock: row.cells[4].textContent === "In Stock" ? "true" : "false"
  };

  currentEditingProduct = data; // Store the product data for reference during save

  document.getElementById("modalTitle").textContent = `Edit Product: ${data.id}`;
  document.getElementById("brand").value = data.brand;
  document.getElementById("name").value = data.name;
  document.getElementById("price").value = data.price;
  document.getElementById("image").value = data.img; 
  document.getElementById("stock").value = data.stock;
  document.getElementById("productModal").style.display = "flex";
}


// =======================
// 🔸 API CALLS
// =======================

// ❗ NEW: Function to handle the actual API update (PUT request)
async function updateProductAPI(productId, data) {
    try {
        const response = await fetch(`${API_URL}/api/catfood/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        // Reload products after successful update
        await loadAdminProducts();
        closeModal();
        alert(`Product ${productId} updated successfully!`);

    } catch (error) {
        console.error("Failed to update product:", error);
        alert("Failed to save product: " + error.message);
    }
}


// =======================
// 🔸 SAVE PRODUCT (Modified to use API for editing)
// =======================
function saveProduct() {
  const brand = document.getElementById("brand").value;
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const image = document.getElementById("image").value;
  const stockValue = document.getElementById("stock").value;

  // Basic validation (can be improved)
  if (!brand || !name || isNaN(price) || !image) {
      return alert("Please fill in all fields correctly.");
  }
  
  const updatedData = {
      brand: brand,
      name: name,
      price: price,
      img: image, // Use 'img' to match catfood.json property
      stock: stockValue === "true" // Convert to boolean for API
  };

  if (currentEditingProduct) {
      // ❗ EDITING EXISTING PRODUCT: Use the new API update function
      updateProductAPI(currentEditingProduct.id, updatedData);
  } else {
      // ❗ ADDING NEW PRODUCT: Since your backend doesn't have a POST route,
      // we'll revert to the local storage add for now, and alert the user.
      alert("Adding new products is not implemented in the API yet. Adding locally.");
      
      let products = JSON.parse(localStorage.getItem("customProducts")) || [];
      const newId = "LOCAL-" + Date.now();
      const newProduct = { id: newId, image: image, stock: stockValue, brand, name, price };
      products.push(newProduct);
      localStorage.setItem("customProducts", JSON.stringify(products));
      loadAdminProducts();
      closeModal();
  }
}

// =======================
// 🔸 DELETE PRODUCT (Not implemented in API, kept as local for now)
// =======================
function deleteProduct(index) {
  if(!confirm("Delete this product?")) return;

  // Since we are loading from API, we can't delete static API products.
  alert("Deletion is not implemented for API products. Please implement a DELETE route in server.js.");
  
  // NOTE: If you still have local storage products, this logic will break
  // because the index no longer correlates to the combined list. 
  // For simplicity, we remove the local storage logic for now.
}


// =======================
// 🔸 LOAD PRODUCTS - API IMPLEMENTATION
// =======================
async function loadAdminProducts() {
  const table = document.querySelector("#productTable tbody");
  table.innerHTML = "<tr><td colspan='7'>Loading products...</td></tr>"; 

  try {
    // 1. Fetch products from the server API
    const response = await fetch(`${API_URL}/api/catfood`); 
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // 2. Parse the JSON response
    const products = await response.json();

    // 3. Clear the table and populate with fetched products
    table.innerHTML = "";
    
    products.forEach(p => {
      const stockStatus = p.stock ? "In Stock" : "Out of Stock";
      const imagePath = p.img.startsWith('Products/') ? p.img : `Products/${p.img}`;

      table.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.brand}</td>
          <td>${p.name}</td>
          <td>₱${p.price.toFixed(2)}</td>
          <td>${stockStatus}</td>
          <td><img src="${imagePath}" style="max-height: 50px;" /></td> 
          <td>
            <button class="action-btn edit-btn" onclick="openEditProduct('${p.id}')">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteProduct('${p.id}')">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    console.error("Error loading products:", error);
    table.innerHTML = `<tr><td colspan='7'>Error loading products: ${error.message}</td></tr>`;
  }
}
async function createProductAPI(data) {
    try {
        const response = await fetch(`${API_URL}/api/catfood`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        // Reload products after successful creation
        await loadAdminProducts();
        closeModal();
        alert(`Product ${result.product.id} created successfully!`);

    } catch (error) {
        console.error("Failed to create new product:", error);
        alert("Failed to create new product: " + error.message);
    }
}

// Execute on load
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadAdminProducts();
});