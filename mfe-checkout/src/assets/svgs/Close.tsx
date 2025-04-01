import * as React from "react";
import { JSX } from "react/jsx-runtime";

export const Close = (props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={29}
    fill="none"
    {...props}
  >
    <mask
      id="a"
      width={28}
      height={29}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <path fill="#D9D9D9" d="M.242.449H27.93v27.688H.242z" />
    </mask>
    <g mask="url(#a)">
      <path
        fill="#000000"
        d="M7.625 22.37 6.01 20.755l6.46-6.46-6.46-6.461 1.615-1.615 6.46 6.46 6.46-6.46 1.616 1.615-6.46 6.46 6.46 6.46-1.615 1.616-6.46-6.46-6.461 6.46Z"
      />
    </g>
  </svg>
);
