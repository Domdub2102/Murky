// Notes:
// store prooduct_id in client side html
// do all cart data and logic client-side

document.addEventListener('navbar-loaded', function() {
    const cartContainer = document.querySelector('.cart-container');
    const cartItems = document.querySelector('.cart-items');
    const cartIcon = document.querySelector('.cart-icon');
    const cartIconSpan = document.querySelector('.cart-icon span');
    const closeCart = document.querySelector('.close-button');
    const checkOut = document.querySelector('.checkout-button');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartUI() {
        cartItems.innerHTML = '';
        let totalQuantity = 0;
        cart.forEach(item => {
            totalQuantity += item.quantity;
            let newItem = document.createElement('div');
            newItem.classList.add('item');
            newItem.dataset.id = item.product_id;
            newItem.innerHTML = `
                <div class="name">${item.product_name}</div>
                <div class="size">${item.size}</div>
                <div class="totalPrice">£${(item.price * item.quantity).toFixed(2)}</div>
                <div class="quantity">
                    <span class="minus">-</span>
                    <span>${item.quantity}</span>
                    <span class="plus">+</span>
                </div>
            `;
            cartItems.appendChild(newItem);
        });
        cartIconSpan.textContent = totalQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    if (cartIcon && cartContainer) {
        cartIcon.addEventListener('click', () => {
            cartContainer.classList.toggle('showCart');
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartContainer.classList.toggle('showCart');
        });
    }

    if (cartItems) {
        cartItems.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('minus') || target.classList.contains('plus')) {
                const product_id = target.closest('.item').dataset.id;
                const isAdding = target.classList.contains('plus');
                const productIndex = cart.findIndex(item => item.product_id === product_id);
                if (productIndex !== -1) {
                    if (isAdding) {
                        cart[productIndex].quantity++;
                    } else if (cart[productIndex].quantity > 1) {
                        cart[productIndex].quantity--;
                    } else {
                        cart.splice(productIndex, 1);
                    }
                    updateCartUI();
                }
            }
        });
    }

    if (checkOut) {
        checkOut.addEventListener('click', () => {
            if (cart.length === 0) {
                alert("Cart is empty");
                return;
            }
            const items = cart.map(item => ({ id: item.product_id, quantity: item.quantity }));
            fetch('/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            })
            .then(response => response.ok ? response.json() : Promise.reject(response))
            .then(({ url }) => window.location = url)
            .catch(error => console.error('Error:', error));
        });
    }

    // Initialize product-specific elements only if they exist
    const sizeSelect = document.getElementById('size');
    const quantity = document.getElementById('quantity');
    const addToCartButton = document.querySelector('.add-to-cart-button');

    if (sizeSelect && quantity && addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const selectedSize = sizeSelect.value;
            const productId = sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-product-id');
            const selectedQuantity = parseInt(quantity.value, 10);
            const productName = document.getElementById('product-description').textContent.trim();
            const priceElement = document.getElementById('price').textContent;
            const productPrice = parseFloat(priceElement.replace('£', ''));

            if (productId && selectedSize && !isNaN(selectedQuantity) && productName && !isNaN(productPrice)) {
                const existingIndex = cart.findIndex(item => item.product_id === productId && item.size === selectedSize);
                if (existingIndex === -1) {
                    cart.push({ product_id: productId, product_name: productName, size: selectedSize, quantity: selectedQuantity, price: productPrice });
                } else {
                    cart[existingIndex].quantity += selectedQuantity;
                }
                updateCartUI();
            } else {
                alert('Please make sure you have selected a size and quantity.');
            }
        });
    }

    // Immediately update the UI if there's already cart data
    updateCartUI();
});
