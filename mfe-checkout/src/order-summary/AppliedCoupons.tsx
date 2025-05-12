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

  const seenCoupons = new Set<string>();

  return (
    <>
      {Object.entries(stores)
        .filter(([_, invoiceData]) => {
          const couponCode = invoiceData.totals?.couponCode;
          if (!couponCode || seenCoupons.has(couponCode)) {
            return false;
          }
          seenCoupons.add(couponCode);
          return true;
        })
        .map(([invoiceKey, invoiceData]) => {
          const couponCode = invoiceData.totals?.couponCode;
          return (
            <li key={invoiceKey} className="qa-cancel order-applied-coupon">
              <div className="order-applied-coupons__box">
                <div className="order-applied-coupons__name">
                  {isHiddenCouponCode(couponCode) ? (
                    <span>{getCouponAliasForCouponCode(couponCode)}</span>
                  ) : (
                    <span>{couponCode}</span>
                  )}
                  <p className="coupon-terms-link">
                    {invoiceData.totals?.couponTerms?.some((term: string) =>
                      term.includes("href")
                    ) ? (
                      (() => {
                        const linkTerm = invoiceData.totals?.couponTerms?.find(
                          (term: string) => term.includes("href")
                        );
                        const hrefMatch = linkTerm?.match(/href="([^"]+)"/);
                        const extractedHref = hrefMatch?.[1] || "#";

                        return (
                          <a
                            href={extractedHref}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms & Conditions
                          </a>
                        );
                      })()
                    ) : (
                      <a onClick={() => toggleTerms(invoiceKey)}>
                        Terms & Conditions
                      </a>
                    )}
                  </p>
                </div>
                <Close onClick={() => handleRemoveCoupon(couponCode)} />
              </div>

              {openTerms[invoiceKey] && (
                <div className="order-applied-coupons__term-text">
                  {invoiceData.totals?.couponTerms?.map(
                    (term: any, index: number) => (
                      <p key={index}>{term}</p>
                    )
                  )}
                </div>
              )}
            </li>
          );
        })}
    </>
  );
};

export default AppliedCoupons;
