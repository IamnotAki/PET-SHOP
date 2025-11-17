/* ======================================================
   ADMIN DASHBOARD JS — FULLY WORKING
======================================================== */

// ========================
// 🔸 LOAD USERS (STATIC DEMO)
// ========================
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

// Toggle Active / Blocked status
function toggleStatus(id) {
  const users = JSON.parse(localStorage.getItem("users"));
  const user = users.find(u => u.id === id);
  if(user){
    user.status = user.status === "Active" ? "Blocked" : "Active";
    localStorage.setItem("users", JSON.stringify(users));
    loadUsers();
  }
}

// ========================
// 🔸 PRODUCT MODAL CONTROL
// ========================
let editIndex = null;

function openAddProduct() {
  editIndex = null;
  document.getElementById("modalTitle").textContent = "Add Product";
  document.getElementById("brand").value = "";
  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("image").value = "";
  document.getElementById("stock").value = "true";
  document.getElementById("productModal").style.display = "flex";
}

function openEditProduct(index) {
  const products = JSON.parse(localStorage.getItem("customProducts")) || [];
  const p = products[index];
  if(!p) return;

  editIndex = index;
  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("brand").value = p.brand;
  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("image").value = p.image;
  document.getElementById("stock").value = p.stock;
  document.getElementById("productModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// ========================
// 🔸 SAVE PRODUCT
// ========================
function saveProduct() {
  const brand = document.getElementById("brand").value.trim();
  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  const image = document.getElementById("image").value.trim();
  const stock = document.getElementById("stock").value;

  if(!brand || !name || !price || !image){
    alert("Please fill all fields.");
    return;
  }

  let products = JSON.parse(localStorage.getItem("customProducts")) || [];

  if(editIndex === null){
    // ADD
    products.push({ id: Date.now(), brand, name, price, stock, image });
  } else {
    // EDIT
    products[editIndex] = { ...products[editIndex], brand, name, price, stock, image };
  }

  localStorage.setItem("customProducts", JSON.stringify(products));
  loadAdminProducts();
  closeModal();
}

// ========================
// 🔸 DELETE PRODUCT
// ========================
function deleteProduct(index) {
  if(!confirm("Delete this product?")) return;

  let products = JSON.parse(localStorage.getItem("customProducts")) || [];
  products.splice(index,1);
  localStorage.setItem("customProducts", JSON.stringify(products));
  loadAdminProducts();
}

// ========================
// 🔸 LOAD PRODUCTS
// ========================
function loadAdminProducts() {
  const table = document.querySelector("#productTable tbody");
  table.innerHTML = "";
  const products = JSON.parse(localStorage.getItem("customProducts")) || [];

  products.forEach((p,index) => {
    table.innerHTML += `
      <tr>
        <td>${p.id}</td>
        <td>${p.brand}</td>
        <td>${p.name}</td>
        <td>₱${p.price.toFixed(2)}</td>
        <td>${p.stock === "true" ? "In Stock" : "Out of Stock"}</td>
        <td><img src="${p.image}" /></td>
        <td>
          <button class="action-btn edit-btn" onclick="openEditProduct(${index})">Edit</button>
          <button class="action-btn delete-btn" onclick="deleteProduct(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// ========================
// 🔸 INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadAdminProducts();
});
