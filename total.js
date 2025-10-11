function openProduct(name, price, img) {
  currentProduct = { name, price, img };
  modalTitle.textContent = name;
  modalPrice.textContent = '₱' + price.toFixed(2);
  modalImg.src = img;
  modal.classList.remove('hide');
  modal.classList.add('show');
}

function closeModal() {
  modal.classList.remove('show');
  modal.classList.add('hide');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}
let cartPanel = document.getElementById('cartPanel');
let cartItems = document.getElementById('cartItems');
let cartTotal = document.getElementById('cartTotal');

function showCart() {
  cartItems.innerHTML = '';
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0;

  cart.forEach(item => {
    let itemTotal = item.price * item.qty;
    total += itemTotal;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.qty} × ${item.name}</span>
        <span>₱${itemTotal.toFixed(2)}</span>
      </div>
    `;
  });

  cartTotal.textContent = `Total: ₱${total.toFixed(2)}`;
  cartPanel.classList.add('show');
}

function closeCart() {
  cartPanel.classList.remove('show');
}

/* Open cart automatically after adding item */
function addToCart() {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.push({ ...currentProduct, qty });
  localStorage.setItem('cart', JSON.stringify(cart));
  closeModal();
  showCart(); // 👈 Automatically open the cart after adding
}
