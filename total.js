// =========================
// 🔸 CONFIGURATION
// =========================
const API_URL = "http://localhost:3000"; 

// =========================
// 🔸 DOM ELEMENTS
// =========================
const productsContainer = document.querySelector('.products'); // Ensure your HTML has this class
const modal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const modalPrice = document.getElementById('modalPrice');
const modalImg = document.getElementById('modalImg');
const qtyDisplay = document.getElementById('qty');
const cartPanel = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalDisplay = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

let currentProduct = {};
let qty = 1;

// =========================
// 🔸 FETCH & RENDER PRODUCTS
// =========================
async function loadProducts() {
  if (!productsContainer) return; 

  try {
    const response = await fetch(`${API_URL}/api/catfood`);
    if (!response.ok) throw new Error("Failed to connect to server");
    
    const allProducts = await response.json();

    const path = window.location.pathname;
    let filterPrefix = "";

    // Detect specific category pages
    if (path.includes("Dogfoodsect.html")) filterPrefix = "DF";
    else if (path.includes("Catfoodsect.html")) filterPrefix = "CF";
    else if (path.includes("Accesories")) filterPrefix = "AC"; 
    else if (path.includes("Health")) filterPrefix = "HP";

    const filteredProducts = allProducts.filter(p => {
        // 1. If on a specific category page (Dog, Cat, etc.), filter by ID prefix
        if (filterPrefix) {
            return p.id.startsWith(filterPrefix);
        }
        
        // 2. If on the HOMEPAGE (no filterPrefix), show ONLY Royal Canin
        // We check the brand (from JSON) or the name
        return p.brand === "Royal Canid" || p.name.toLowerCase().includes("royal canin");
    });

    productsContainer.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align:center;">No products found.</p>`;
        return;
    }

    filteredProducts.forEach(product => {
      const imgSrc = product.img.startsWith('http') ? product.img : `${API_URL}/${product.img}`;

      const card = document.createElement('div');
      card.classList.add('product-card');

      card.innerHTML = `
        <div class="like-btn">❤</div>
        <img src="${imgSrc}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>₱${product.price.toFixed(2)}</p>
        <div class="product-actions"></div>
      `;

      // Click Card -> Open Modal
      card.addEventListener('click', () => {
          openProduct(product.name, product.price, imgSrc, product.id);
      });

      // Like Button
      const likeBtn = card.querySelector('.like-btn');
      likeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          likeBtn.classList.toggle("liked");
      });

      const actionsContainer = card.querySelector('.product-actions');

      // Buy Now -> Open Modal
      const buyBtn = document.createElement('button');
      buyBtn.className = 'buy-btn buy';
      buyBtn.textContent = 'Buy Now';
      buyBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          openProduct(product.name, product.price, imgSrc, product.id);
      });

      // Add to Cart -> Direct Add
      const addBtn = document.createElement('button');
      addBtn.className = 'buy-btn add';
      addBtn.textContent = 'Add to Cart';
      addBtn.addEventListener('click', (e) => {
          e.stopPropagation(); 
          addToCartDirect(product.name, product.price, imgSrc, product.id);
      });

      actionsContainer.appendChild(buyBtn);
      actionsContainer.appendChild(addBtn);

      productsContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading products:", error);
    productsContainer.innerHTML = `<p style="text-align:center; color:red;">Failed to load products.</p>`;
  }
}

// =========================
// 🔸 BUTTON FUNCTIONS
// =========================

function addToCartDirect(name, price, img, id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartSidebar();
  cartPanel.classList.add("active"); 
}

function buyNowDirect(name, price, img, quantity) {
  localStorage.setItem('selectedProduct', JSON.stringify({
      name: name,
      price: price,
      image: img,
      qty: quantity
  }));
  window.location.href = "checkout.html";
}

function checkoutCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  localStorage.setItem('checkoutCart', JSON.stringify(cart));
  localStorage.removeItem('selectedProduct');
  window.location.href = "checkout.html";
}

// =========================
// 🔸 MODAL & CART UTILITIES
// =========================
function updateCartSidebar() {
  if (!cartItemsContainer) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cartItemsContainer.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;
    
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div>
        <p>${item.name}</p>
        <small>₱${item.price} x ${item.qty}</small>
      </div>
      <span class="remove-btn" style="cursor:pointer; color:red; margin-left:auto;">✖</span>
    `;
    
    div.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(index));
    cartItemsContainer.appendChild(div);
  });

  if (cartTotalDisplay) {
    cartTotalDisplay.textContent = "Total: ₱" + total.toFixed(2);
  }
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartSidebar();
}

function openProduct(name, price, img, id) {
  currentProduct = { id, name, price, img };
  modalTitle.textContent = name;
  modalPrice.textContent = '₱' + price.toFixed(2);
  modalImg.src = img;
  qty = 1;
  qtyDisplay.textContent = qty;
  
  modal.classList.add('show');
  modal.style.display = "flex"; 
}

function closeModal() {
  modal.classList.remove('show');
  modal.style.display = "none";
}

function changeQty(amount) {
  qty = Math.max(1, qty + amount);
  qtyDisplay.textContent = qty;
}

function addToCart() { 
  addToCartDirect(currentProduct.name, currentProduct.price, currentProduct.img, currentProduct.id);
  closeModal();
}

function buyNow() { 
  buyNowDirect(currentProduct.name, currentProduct.price, currentProduct.img, qty);
}

function toggleCart() { cartPanel.classList.toggle("active"); }
function closeCart() { cartPanel.classList.remove("active"); }

// =========================
// 🔸 INITIALIZE
// =========================
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartSidebar();

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        checkoutCart();
    });
  }
});