import React, { useEffect, useRef, useState } from "react";
import "./Title.scss";
interface TitleProps {
  title: string;
  productLinkUrl?: string;
}
const Title: React.FC<TitleProps> = React.memo(
  ({ title, productLinkUrl = "" }) => {
    const titleRef = useRef<HTMLDivElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
      if (titleRef.current) {
        if (titleRef.current.scrollHeight > titleRef.current.clientHeight) {
          setShowTooltip(true);
        } else {
          setShowTooltip(false);
        }
      }
    }, [titleRef.current]);
    return (
      <>
        <a className="qa-product-title title-anchor" href={productLinkUrl}>
          <span
            className="title"
            ref={titleRef}
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
        </a>
        {showTooltip && (
          <span
            className="tooltip-title"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
        )}
      </>
    );
  }
);
export default Title;
