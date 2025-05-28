const shippingAddress = '.js-checkout-shipping-address';

export const initiateCheckoutEventListeners = () => {
    handleReturnToCartListener();
};

function handleReturnToCartListener(){
    const returnToCartButton = document.querySelector('.js-checkout-return-to-cart');
    if(returnToCartButton){
        returnToCartButton.addEventListener('click', (e) => {
            const cartHref = returnToCartButton.getAttribute("href");
            handleReturnToCart(e, cartHref);
        })
    }
}

function handleReturnToCart(event, cartHref) {
    event.preventDefault();
    let shippingId = "";
    const shipAddressElement = document.querySelector(shippingAddress);
    if(shipAddressElement){
        shippingId = document.querySelector(shippingAddress).getAttribute('data-ship-address-id');
    }

    window.location.href = `${cartHref}?shippingId=${shippingId}`;
}