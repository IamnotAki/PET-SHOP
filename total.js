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
