import React from 'react';
import { Helmet } from 'react-helmet';
import {GET_C2P_DPAID, GET_C2P_LIB} from "../utils/urlResolver";

const HeadHelmet = () => {
    return (
        <Helmet>
            {/*TODO: Load these c2p files conditionally (only US and when siteflag is on)*/}
            <script
                src={`${GET_C2P_LIB()}?srcDpaId=${GET_C2P_DPAID()}&locale=en_US`}
                async
            ></script>
            <script
                type="module"
                src="https://src.mastercard.com/srci/integration/components/src-ui-kit/src-ui-kit.esm.js"
            ></script>
            <link
                rel="stylesheet"
                href="https://src.mastercard.com/srci/integration/components/src-ui-kit/src-ui-kit.css"
            />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet"/>
            <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBdN1EI-Hi2HzTPb5qAjOiRKfTB36JIAis&libraries=places"></script>
            {/* <script crossorigin
        src="https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js"
        ></script> */}
        </Helmet>
    );
};

export default HeadHelmet;