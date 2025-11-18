// ===============================
// ADMIN DASHBOARD (FIXED VERSION)
// ===============================

const API_URL = "http://localhost:3000";
let currentEditingProduct = null;

// =======================
// USERS (STATIC DEMO)
// =======================
function loadUsers() {
  const users = JSON.parse(localStorage.getItem("users")) || [
    { id: 1, name: "John Doe", email: "john@gmail.com", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@gmail.com", status: "Blocked" }
  ];

  localStorage.setItem("users", JSON.stringify(users));

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
  const users = JSON.parse(localStorage.getItem("users"));
  const user = users.find(u => u.id === id);

  if (user) {
    user.status = user.status === "Active" ? "Blocked" : "Active";
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
}

// =======================
// MODAL CONTROLS
// =======================
function closeModal() {
  document.getElementById("productModal").style.display = "none";
  currentEditingProduct = null;

  document.getElementById("type").value = "";
  document.getElementById("brand").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("stock").value = "true";
}

function openAddProduct() {
  document.getElementById("modalTitle").textContent = "Add Product";
  closeModal();
  document.getElementById("productModal").style.display = "flex";
}

// =======================
// EDIT PRODUCT
// =======================
function openEditProduct(productId) {
  const table = document.querySelector("#productTable tbody");
  const row = Array.from(table.rows).find(r => r.cells[0].textContent === productId);

  if (!row) return alert("Product not found.");

  const data = {
    id: row.cells[0].textContent,
    brand: row.cells[1].textContent,
    name: row.cells[2].textContent,
    price: parseFloat(row.cells[3].textContent.replace("₱", "")),
    img: row.cells[5].querySelector("img").src.replace(API_URL + "/", ""),
    stock: row.cells[4].textContent === "In Stock" ? "true" : "false"
  };

  currentEditingProduct = data;

  document.getElementById("modalTitle").textContent = `Edit Product: ${data.id}`;
  document.getElementById("brand").value = data.brand;
  document.getElementById("name").value = data.name;
  document.getElementById("price").value = data.price;
  document.getElementById("image").value = data.img;
  document.getElementById("stock").value = data.stock;

  document.getElementById("productModal").style.display = "flex";
}

// =======================
// SAVE PRODUCT
// =======================
function saveProduct() {
  const brand = document.getElementById("brand").value;
  const name = document.getElementById("name").value;
  const price = parseFloat(document.getElementById("price").value);
  const image = document.getElementById("image").value;
  const stockValue = document.getElementById("stock").value;
  const productType = document.getElementById("type").value;

  if (!brand || !name || isNaN(price) || !image || !productType) {
    return alert("Please fill all fields.");
  }

  const productPayload = {
    brand,
    name,
    price,
    img: image,
    stock: stockValue === "true",
    type: productType
  };

  if (currentEditingProduct) {
    updateProductAPI(currentEditingProduct.id, productPayload);
  } else {
    createProductAPI(productPayload);
  }
}

// =======================
// API: UPDATE PRODUCT
// =======================
async function updateProductAPI(productId, data) {
  try {
    const response = await fetch(`${API_URL}/api/catfood/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(await response.text());

    await loadAdminProducts();
    closeModal();
    alert(`Product ${productId} updated successfully!`);

  } catch (error) {
    alert("Update Failed: " + error.message);
  }
}

// =======================
// API: CREATE PRODUCT
// =======================
async function createProductAPI(data) {
  try {
    const response = await fetch(`${API_URL}/api/catfood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error(await response.text());

    await loadAdminProducts();
    closeModal();
    alert("Product created successfully!");

  } catch (error) {
    alert("Create Failed: " + error.message);
  }
}

// =======================
// API: DELETE PRODUCT
// =======================
async function deleteProductAPI(productId) {
  try {
    const response = await fetch(`${API_URL}/api/catfood/${productId}`, {
      method: "DELETE"
    });

    if (!response.ok) throw new Error(await response.text());

    await loadAdminProducts();
    alert(`Product ${productId} deleted.`);

  } catch (error) {
    alert("Delete Failed: " + error.message);
  }
}

function deleteProduct(productId) {
  if (!confirm(`Delete product ${productId}?`)) return;
  deleteProductAPI(productId);
}

// =======================
// LOAD PRODUCTS (FIXED IMAGE HANDLING)
// =======================
async function loadAdminProducts() {
  const table = document.querySelector("#productTable tbody");
  table.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

  try {
    const response = await fetch(`${API_URL}/api/catfood`);
    if (!response.ok) throw new Error("Failed to fetch products");

    const products = await response.json();
    table.innerHTML = "";

    products.forEach(p => {
      const stockStatus = p.stock ? "In Stock" : "Out of Stock";

      // 🔥 FIXED IMAGE PATH — This is the important part
      const imagePath = p.img.startsWith("http")
        ? p.img
        : `${API_URL}/${p.img}`;

      table.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.brand}</td>
          <td>${p.name}</td>
          <td>₱${p.price.toFixed(2)}</td>
          <td>${stockStatus}</td>
          <td><img src="${imagePath}" style="max-height:50px;"/></td>
          <td>
            <button class="action-btn edit-btn" onclick="openEditProduct('${p.id}')">Edit</button>
            <button class="action-btn delete-btn" onclick="deleteProduct('${p.id}')">Delete</button>
          </td>
        </tr>
      `;
    });

  } catch (error) {
    table.innerHTML = `<tr><td colspan="7">Error loading products</td></tr>`;
  }
}

// =======================
// INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadAdminProducts();
});
