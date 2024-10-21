import React from "react";
import "./ErrorPage.scss";

const categories = [
  {
    href: "https://www.shop.com/search/Health+~+Nutrition--20?-6=",
    imgSrc:
      "https://img.shop.com/Image/resources/images/error-category-health.jpg?id=5307482",
    alt: "Health & Nutrition",
    label: "Shop Health & Nutrition",
  },
  {
    href: "https://www.shop.com/Beauty/Skin+Care-3?-6",
    imgSrc:
      "https://img.shop.com/Image/resources/images/error-category-skincare.jpg?id=5307479",
    alt: "Skincare",
    label: "Shop Skincare",
  },
  {
    href: "https://www.shop.com/Beauty/-20?-6",
    imgSrc:
      "https://img.shop.com/Image/resources/images/error-category-beauty.jpg?id=5307480",
    alt: "Beauty",
    label: "Shop Beauty",
  },
  {
    href: "https://www.shop.com/Jewelry/-20?-6",
    imgSrc:
      "https://img.shop.com/Image/resources/images/error-category-jewelry.jpg?id=5307481",
    alt: "Jewelry",
    label: "Shop Jewelry",
  },
];

const CategoryLink: React.FC<{
  href: string;
  imgSrc: string;
  alt: string;
  label: string;
}> = ({ href, imgSrc, alt, label }) => (
  <a href={href} className="category">
    <img src={imgSrc} alt={alt} />
    <span>{label}</span>
  </a>
);

const ErrorPage: React.FC = () => {
  return (
    <div className="error-page">
      <h1>sorry.</h1>
      <p>Please try searching again or select a category to explore.</p>
      <div className="categories">
        {categories.map((cat, index) => (
          <CategoryLink key={index} {...cat} />
        ))}
      </div>
    </div>
  );
};

export default ErrorPage;
