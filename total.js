// =========================
// 🔸 MODAL ELEMENTS
// =========================
let modal = document.getElementById('productModal');
let modalTitle = document.getElementById('modalTitle');
let modalPrice = document.getElementById('modalPrice');
let modalImg = document.getElementById('modalImg');
let qtyDisplay = document.getElementById('qty');

let currentProduct = {};
let qty = 1;

// =========================
// 🔸 CART SIDEBAR ELEMENTS
// =========================
let cartPanel = document.getElementById('cartSidebar');
let cartItems = document.getElementById('cartItems');
let cartTotal = document.getElementById('cartTotal');

// =========================
// 🔸 DYNAMIC PRODUCT LOADING
// =========================
async function loadProducts() {
  try {
    const response = await fetch('products.json'); // default products
    let products = await response.json();

    // Add admin-added products from localStorage
    const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
    products = [...products, ...customProducts];

    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('product-card');

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onclick="openProduct('${product.name}', ${product.price}, '${product.image}')">
        <h3>${product.name}</h3>
        <p>₱${product.price.toFixed(2)}</p>
        <button onclick="addToCartDirect('${product.name}', ${product.price}, '${product.image}')">Add to Cart</button>
        <button onclick="buyProduct('${product.name}', ${product.price}, '${product.image}')">Buy Now</button>
        <span class="like-btn" onclick="toggleLike(this, event)">❤️</span>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// =========================
// 🔸 OPEN PRODUCT MODAL
// =========================
function openProduct(name, price, img) {
  currentProduct = { name, price, img };
  modalTitle.textContent = name;
  modalPrice.textContent = '₱' + price.toFixed(2);
  modalImg.src = img;

  qty = 1;
  qtyDisplay.textContent = qty;

  modal.style.display = 'flex';
  modal.classList.remove('hide');
  modal.classList.add('show');
}

// =========================
// 🔸 CLOSE MODAL
// =========================
function closeModal() {
  modal.classList.remove('show');
  modal.classList.add('hide');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// =========================
// 🔸 CHANGE QUANTITY IN MODAL
// =========================
function changeQty(amount) {
  qty = Math.max(1, qty + amount);
  qtyDisplay.textContent = qty;
}

// =========================
// 🔸 ADD TO CART (FROM MODAL)
// =========================
function addToCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingIndex = cart.findIndex(item => item.name === currentProduct.name);
  if (existingIndex > -1) {
    cart[existingIndex].qty += qty;
  } else {
    cart.push({ ...currentProduct, qty });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  closeModal();
  showCart();
}

// =========================
// 🔸 ADD TO CART DIRECTLY FROM CARD
// =========================
function addToCartDirect(name, price, img) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingIndex = cart.findIndex(item => item.name === name);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ name, price, img, qty: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  showCart();
}

// =========================
// 🔸 BUY NOW (FROM MODAL)
// =========================
function buyNow() {
  if (currentProduct && currentProduct.name) {
    localStorage.setItem('selectedProduct', JSON.stringify({
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.img,
      qty: qty
    }));

    localStorage.removeItem('checkoutCart');
  }

  window.location.href = "checkout.html";
}

// =========================
// 🔸 BUY NOW (FROM CARD)
// =========================
function buyProduct(name, price, img) {
  localStorage.setItem('selectedProduct', JSON.stringify({
    name: name,
    price: price,
    image: img,
    qty: 1
  }));

  localStorage.removeItem('checkoutCart');
  window.location.href = "checkout.html";
}

// =========================
// 🔸 SHOW CART SIDEBAR
// =========================
function showCart() {
  cartItems.innerHTML = '';
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0;

  cart.forEach((item, index) => {
    let itemTotal = item.price * item.qty;
    total += itemTotal;

    cartItems.innerHTML += `
      <div class="cart-item" data-index="${index}">
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <p>${item.name}</p>
          <small>₱${item.price.toFixed(2)} × 
            <button onclick="changeCartQty(${index}, -1)">-</button>
            <span>${item.qty}</span>
            <button onclick="changeCartQty(${index}, 1)">+</button>
          </small>
        </div>
        <span class="remove-btn" onclick="removeItem(${index})">✖</span>
      </div>
    `;
  });

  cartTotal.innerHTML = `
    <p>Total: ₱${total.toFixed(2)}</p>
    <button class="checkout-btn" onclick="checkoutCart()">Checkout</button>
  `;

  cartPanel.classList.add('active');
}

// =========================
// 🔸 CLOSE CART SIDEBAR
// =========================
function closeCart() {
  cartPanel.classList.remove('active');
}

// =========================
// 🔸 REMOVE ITEM FROM CART
// =========================
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (index > -1 && index < cart.length) {
    cart.splice(index, 1);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  showCart();
}

// =========================
// 🔸 CHANGE CART ITEM QTY
// =========================
function changeCartQty(index, amount) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (index > -1 && index < cart.length) {
    cart[index].qty = Math.max(1, cart[index].qty + amount);
    localStorage.setItem('cart', JSON.stringify(cart));
    showCart();
  }
}

// =========================
// 🔸 LIKE BUTTON TOGGLE
// =========================
function toggleLike(el, event) {
  event.stopPropagation();
  el.classList.toggle("liked");
}

// =========================
// 🔸 CHECKOUT ENTIRE CART
// =========================
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
// 🔸 ADD ADMIN PRODUCT FUNCTION
// =========================
function addAdminProduct(name, price, image) {
  const customProducts = JSON.parse(localStorage.getItem('customProducts')) || [];
  customProducts.push({ name, price, image });
  localStorage.setItem('customProducts', JSON.stringify(customProducts));
  loadProducts(); // Reload products including admin ones
}

// =========================
// 🔸 INITIALIZE CART & PRODUCTS ON PAGE LOAD
// =========================
document.addEventListener('DOMContentLoaded', () => {
  showCart();
  loadProducts(); // ✅ Load products dynamically
});
