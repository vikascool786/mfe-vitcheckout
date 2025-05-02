import * as React from "react";
import { JSX } from "react/jsx-runtime";

export const Close = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={29}
    fill="none"
    viewBox="0 0 28 29"
    {...props}
  >
    <path
      d="M7.625 22.37L6.01 20.755l6.46-6.46-6.46-6.461L7.625 6.22l6.46 6.46 6.46-6.46 1.616 1.615-6.46 6.46 6.46 6.46-1.615 1.616-6.46-6.46-6.461 6.46z"
      fill="#000"
    />
  </svg>
);
