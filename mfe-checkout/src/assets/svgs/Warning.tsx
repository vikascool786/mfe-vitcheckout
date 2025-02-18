import * as React from "react";
import { SVGProps } from "react";
export const Warning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    fill="none"
    {...props}
  >
    <mask
      id="a"
      width={23}
      height={23}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <path fill="#D9D9D9" d="M.012.816h22.051v22.051H.012z" />
    </mask>
    <g mask="url(#a)">
      <path
        fill="#1C1B1F"
        d="M.934 20.105 11.04 2.648l10.107 17.457H.934Zm3.17-1.837h13.873L11.04 6.324 4.103 18.268Zm6.936-.919c.26 0 .479-.088.655-.264a.889.889 0 0 0 .264-.655.89.89 0 0 0-.264-.655.889.889 0 0 0-.655-.264.889.889 0 0 0-.654.264.89.89 0 0 0-.265.655c0 .26.088.479.265.655a.889.889 0 0 0 .654.264Zm-.919-2.756h1.838V9.999h-1.838v4.594Z"
      />
    </g>
  </svg>
);
