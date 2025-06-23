export interface ProductSummaryItemProps {
  image: ImageSource;
  subtotal: string;
  tax: string;
  shipping: string;
  cashback: string;
  total: string;
}

export interface ProductSummaryProps {
  products: ProductSummaryItemProps[];
}
