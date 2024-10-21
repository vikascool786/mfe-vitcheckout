import React from "react";
import "./ProductDerivedAttributes.scss";
import { Reward, Coupon, FreeShipping } from "../../utils/types/types";

interface ProductCashbackProps {
  rewards?: Reward[];
  coupon?: Coupon;
  freeShipping?: FreeShipping;
}
const ProductDerivedAttributes: React.FC<ProductCashbackProps> = ({
  rewards,
  coupon,
  freeShipping,
}) => {
  const renderSlash = (index: number) => <>{index > 0 ? "/" : ""}</>;

  return (
    <>
      {rewards && (
        <div className="qa-rewards reward-container">
          {rewards.map((reward, index) => {
            const type = reward.type.toLowerCase();
            if (type === "cashback") {
              return (
                <p
                  key={new Date().getTime() * Math.random()}
                  className="reward"
                >
                  {renderSlash(index)} + {reward.value} / {reward.percent}
                  <img
                    className="reward-cashback-icon"
                    src="https://img.shop.com/Image/resources/images/cashback-icon.svg"
                    alt=""
                  />
                  Cashback
                </p>
              );
            }

            return (
              <p className="reward">
                {renderSlash(index)} {reward.percent} {type.toUpperCase()}
              </p>
            );
          })}
        </div>
      )}

      {coupon && (
        <div className="qa-product-coupon coupon-container">
          <p className="coupon-label">{coupon.label}</p>
          <span className="coupon-tag">{coupon.code}</span>
        </div>
      )}
      {freeShipping?.message && (
        <p className="free-shipping-label">{freeShipping.message}</p>
      )}
    </>
  );
};
export default ProductDerivedAttributes;
