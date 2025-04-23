import React, { useState } from "react";
import { IStores } from "../interfaces/ShopperCart";
import { OrderStores } from "../interfaces/Order";
import { Close } from "../assets/svgs/Close";
import { hideCouponCode } from "../utils/CouponUtils";

interface AppliedCouponsProps {
  stores: OrderStores;
  handleRemoveCoupon: (couponCode: string) => void | Promise<void>;
}

const AppliedCoupons: React.FC<AppliedCouponsProps> = ({
  stores,
  handleRemoveCoupon,
}) => {
  const [openTerms, setOpenTerms] = useState<{ [key: string]: boolean }>({});

  const toggleTerms = (invoiceKey: string) => {
    setOpenTerms((prev) => ({
      ...prev,
      [invoiceKey]: !prev[invoiceKey],
    }));
  };

  return (
    <>
      {Object.entries(stores)
        .filter(([_, invoiceData]) => {
          const code = invoiceData.totals?.couponCode;
          return code && !hideCouponCode(code);
        })
        .map(([invoiceKey, invoiceData]) => (
          <li key={invoiceKey} className="qa-cancel order-applied-coupon">
            <div className="order-applied-coupons__box">
              <div className="order-applied-coupons__name">
                {invoiceData.totals?.couponCode}
                <p className="coupon-terms-link">
                  <a onClick={() => toggleTerms(invoiceKey)}>
                    Terms & Conditions
                  </a>
                </p>
              </div>
              <Close
                onClick={() =>
                  handleRemoveCoupon(invoiceData.totals?.couponCode)
                }
              />
            </div>

            {openTerms[invoiceKey] && (
              <div className="order-applied-coupons__term-text">
                {invoiceData.totals?.couponTerms?.map(
                  (term: any, index: number) => {
                    if (term.includes("href")) {
                      // dangerously set inner HTML
                      return (
                        <p
                          key={index}
                          dangerouslySetInnerHTML={{ __html: term }}
                        />
                      );
                    }
                    return <p key={index}>{term}</p>;
                  }
                )}
              </div>
            )}
          </li>
        ))}
    </>
  );
};

export default AppliedCoupons;
