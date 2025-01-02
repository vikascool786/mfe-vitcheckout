/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

const Click2PaySignOut = (function(){
    function handleSignout(c2pInstance){
        console.log("Mastercard click2pay embedded signOut()");
        const signOutPromise = c2pInstance.signOut();
        signOutPromise
            .then(response => signOutSuccessHandler(response))
            .catch(error => signOutFailedHandler(error))
    }

    function signOutSuccessHandler(response){
        console.log("signOut() SUCCESS", response);
        //TODO: update c2p state
    }

    function signOutFailedHandler(error){
        console.error("signOut() failed error: " + error.message);
    }

    return {
        handleSignout
    }
})();

export default Click2PaySignOut;