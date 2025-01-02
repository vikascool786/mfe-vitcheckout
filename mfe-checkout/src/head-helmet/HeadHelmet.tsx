import React from 'react';
import { Helmet } from 'react-helmet';
import { GET_CLICK2PAY_DPA_ID, GET_CLICK2PAY_JS_LIB } from "../utils/ApiConstants";

const HeadHelmet = () => {
    return (
        <Helmet>
            {/*TODO: Load these c2p files conditionally (only US and when siteflag is on)*/}
            <script
                src={`${GET_CLICK2PAY_JS_LIB}?srcDpaId=${GET_CLICK2PAY_DPA_ID}&locale=en_US`}
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
        </Helmet>
    );
};

export default HeadHelmet;