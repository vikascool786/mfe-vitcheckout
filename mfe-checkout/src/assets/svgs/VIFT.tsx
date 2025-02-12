import * as React from "react";
import { SVGProps } from "react";
export const VIFT = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={18}
    height={19}
    fill="none"
    {...props}
  >
    <g clipPath="url(#a)">
      <path fill="#21093A" d="M9 18.29a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path
        fill="url(#b)"
        d="M3.871 4.379h2.63l2.585 6.856h.029l2.63-6.856h2.469L9.896 14.842H8.051L3.87 4.38Z"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={3.871}
        x2={14.213}
        y1={9.609}
        y2={9.609}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C9D855" />
        <stop offset={0.49} stopColor="#69BA86" />
        <stop offset={1} stopColor="#408DA1" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 .29h18v18H0z" />
      </clipPath>
    </defs>
  </svg>
);
