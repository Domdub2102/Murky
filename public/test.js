document.addEventListener('navbar-loaded', function() {

    let cartIcon = document.querySelector('.cart-icon');
    let cartIconSpan = document.querySelector('.cart-icon span');
    let cartContainer = document.querySelector('.cart-container');

    let sizeSelect = document.getElementById('size');
    let quantity = document.getElementById('quantity');
    let addToCartButton = document.querySelector('.add-to-cart-button');

    let cartItems = document.querySelector('.cart-items');
    let closeCart = document.querySelector('.close-button');
    let checkOut = document.querySelector('.checkout-button');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cartIcon.addEventListener('click', () => {
        console.log('clicked');
        cartContainer.classList.toggle('showCart');
    })
    closeCart.addEventListener('click', () => {
        cartContainer.classList.toggle('showCart');
    })


    addToCartButton.addEventListener('click', () => {
        // Listen for click on add to cart button
        const selectedSize = sizeSelect.options[sizeSelect.selectedIndex].value;
        const productId = sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-product-id');
        const selectedQuantity = quantity.value;
        const productName = document.getElementById('product-description').textContent;
        const priceElement = document.getElementById('price').textContent;
        const productPrice = parseFloat(priceElement.replace('£', ''));

        //Add product to cart
        if (productId && productName && productPrice && selectedSize && selectedQuantity) {
            addToCart(productId, productName, productPrice, selectedSize, selectedQuantity);
            resetInputFields();
            sizeSelect.classList.remove('invalid-input');
        }

        else if (!selectedSize){
            sizeSelect.classList.add('invalid-input');
        }

    });


    const resetInputFields = () => {
        sizeSelect.selectedIndex = 0;
        quantity.value = 1;
    }

    // addToCart takes input of product id and either adds new product or updates quantity in the cart array
    const addToCart = (product_id, product_name, price, size, quantity) => {

        // findIndex will return -1 if not found
        let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
        if (cart.length <= 0) {
            cart = [{
                product_id: product_id,
                product_name: product_name,
                price: parseFloat(price),
                size: size,
                quantity: parseInt(quantity),
            }];
        }
        else if (positionThisProductInCart < 0) {
            cart.push({
                product_id: product_id,
                product_name: product_name,
                price: parseFloat(price),
                size: size,
                quantity: parseInt(quantity),
            });
        }
        else {
            cart[positionThisProductInCart].quantity = cart[positionThisProductInCart].quantity + 1;
        }

        console.log('item added');
        addCartToHTML();
        addCartToMemory();
    }


    const addCartToMemory = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    const addCartToHTML = () => {
        cartItems.innerHTML = '';
        let totalQuantity = 0;
        if(cart.length > 0){
            cart.forEach(item => {
                // total Quantity is used for the cart icon span (number of items in cart)
                totalQuantity = totalQuantity +  item.quantity;
                let newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.id = item.product_id;

                cartItems.appendChild(newItem);
                newItem.innerHTML = `

                <div class="name">
                    ${item.product_name}
                </div>
                <div class="size">
                    ${item.size}
                </div>
                <div class="totalPrice">£${item.price * item.quantity}.00</div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${item.quantity}</span>
                    <span class="plus">></span>
                </div>
                `;
            })
        }
        cartIconSpan.innerText = totalQuantity;
    }

    cartItems.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
            let product_id = positionClick.parentElement.parentElement.dataset.id;
            let type = 'minus';
            if(positionClick.classList.contains('plus')){
                type = 'plus';
            }
            changeQuantityCart(product_id, type);
        }
    })
    const changeQuantityCart = (product_id, type) => {
        let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
        if(positionItemInCart >= 0){
            let info = cart[positionItemInCart];
            switch (type) {
                case 'plus':
                    cart[positionItemInCart].quantity = cart[positionItemInCart].quantity + 1;
                    break;

                default:
                    let changeQuantity = cart[positionItemInCart].quantity - 1;
                    if (changeQuantity > 0) {
                        cart[positionItemInCart].quantity = changeQuantity;
                    }else{
                        cart.splice(positionItemInCart, 1);
                    }
                    break;
            }
        }
        addCartToHTML();
        addCartToMemory();
    }

    if(localStorage.getItem('cart')){
        cart = JSON.parse(localStorage.getItem('cart'));
        addCartToHTML();
    }


    checkOut.addEventListener('click', () => {

        console.log("checkout clicked");

        // return an error if cart is empty
        if (cart.length <= 0){
            alert("Cart is empty");
            return;
        }

        let items = [];
        cart.forEach(item => {
            items.push({
                id: item.product_id,
                quantity: item.quantity
            });
        });

        // sends client-side product data to the server
        // need to make this have the real values of product_id

        fetch('/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                items
            })
        })
        .then(res => {
            if (res.ok) return res.json();
            return res.json().then(json => Promise.reject(json));
        })
        .then(({ url }) => {
            window.location = url;
        })
        .catch(e => {
            console.error(e.error);
        })
    })


});
