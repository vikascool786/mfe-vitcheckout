import { useAtom } from "jotai";
import React from "react";
import { FormHeading } from "../component/Form/Heading/FormHeading";
import { ShippingItem } from "../shipping-item/ShippingItem";
import { ShippingOptions } from "../shipping-options/ShippingOptions";
import { orderData, shippingData } from "../store";
import { getCatalogName } from "../utils/helpers/GetCatalog";
import "./ShippingMethod.scss";

export const ShippingMethod: React.FC = ({}) => {
  const [shipping] = useAtom(shippingData);
  console.log(shipping);
  const [orders] = useAtom(orderData);
  if (!shipping?.shippingSelections) {
    return <p>Loading shipping methods...</p>;
  }

  return (
    <div className="shipping-container">
      <FormHeading title="Shipping Methods & Review Items" />

      <div className="shipping-item-container">
        {Object.values(orders?.stores).map((store, index) => (
          <>
           <div>{getCatalogName(store)}</div>
            <div key={index} className="store-container">
              {store.items.map((item, itemIndex) => (
                <>
                  <div key={itemIndex} className="item-container">
                    {/* Render ShippingItem */}
                    <ShippingItem product={item} />
                  </div>
                </>
              ))}

              {/* Pass store-specific shippingSelections */}
              <ShippingOptions store={store.shippingSelections} />
            </div>
          </>
        ))}
      </div>
    </div>
  );
};
