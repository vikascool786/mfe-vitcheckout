import React, { useState } from 'react';
import { IStores } from '../interfaces/ShopperCart';
import { OrderStores } from '../interfaces/Order';
import { Close } from "../assets/svgs/Close";
import { getCouponAliasForCouponCode, isHiddenCouponCode } from '../utils/CouponUtils';

interface AppliedCouponsProps {
  stores: OrderStores;
  handleRemoveCoupon: (couponCode: string) => void | Promise<void>;
}

const AppliedCoupons: React.FC<AppliedCouponsProps> = ({ stores, handleRemoveCoupon }) => {
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
          return invoiceData.totals?.couponCode;
        })
        .map(([invoiceKey, invoiceData]) => (
          <li key={invoiceKey} className="qa-cancel order-applied-coupon">
            <div className="order-applied-coupons__box">
              <div className="order-applied-coupons__name">
                {isHiddenCouponCode(invoiceData.totals?.couponCode) ? (
                    <span>
                      {getCouponAliasForCouponCode(invoiceData.totals?.couponCode)}
                    </span>
                ) : (
                    <span>
                      {invoiceData.totals?.couponCode}
                    </span>
                )}
                <p className="coupon-terms-link">
                  <a href="#" onClick={() => toggleTerms(invoiceKey)}>
                    Terms & Conditions
                  </a>
                </p>
              </div>
              <Close onClick={() => handleRemoveCoupon(invoiceData.totals?.couponCode)} />
            </div>

            {openTerms[invoiceKey] && (
              <div className="order-applied-coupons__term-text">
                {invoiceData.totals?.couponTerms?.map((term: any, index: number) => (
                  <p key={index}>{term}</p>
                ))}
              </div>
            )}
          </li>
        ))}
    </>
  );
};

export default AppliedCoupons;
