/*
 * Copyright (c) 2024. Market America/SHOP.com. All rights reserved.
 */

import Click2PayEventUtil from "./Click2PayCardEventUtil";

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
        Click2PayEventUtil.triggerClick2PaySignOutEvent();
    }

    function signOutFailedHandler(error){
        console.error("signOut() failed error: " + error.message);
    }

    return {
        handleSignout
    }
})();

export default Click2PaySignOut;