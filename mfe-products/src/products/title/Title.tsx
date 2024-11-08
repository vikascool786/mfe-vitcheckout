import React from "react";
import "./Title.scss";
interface TitleProps {
  title: string;
  productLinkUrl?: string;
}
const Title: React.FC<TitleProps> = React.memo(
  ({ title, productLinkUrl = "" }) => {
    return (
      <>
        <a className="qa-product-title title-anchor" href={productLinkUrl}>
          <span
            className="title"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
          <span
            className="tooltip-title"
            dangerouslySetInnerHTML={{
              __html: title,
            }}
          ></span>
        </a>
      </>
    );
  }
);
export default Title;
