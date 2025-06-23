import * as React from "react";
import { SVGProps } from "react";
const Person = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <mask
      id="a"
      width={25}
      height={25}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
    >
      <path fill="#D9D9D9" d="M.531.977h24v24h-24z" />
    </mask>
    <g mask="url(#a)">
      <path
        fill="#fff"
        d="M12.531 12.977c-1.1 0-2.041-.392-2.825-1.175-.783-.784-1.175-1.725-1.175-2.825s.392-2.042 1.175-2.825c.784-.784 1.725-1.175 2.825-1.175s2.042.391 2.825 1.175c.784.783 1.175 1.725 1.175 2.825s-.391 2.041-1.175 2.825c-.783.783-1.725 1.175-2.825 1.175Zm-8 8v-2.8c0-.567.146-1.088.438-1.563.291-.475.679-.837 1.162-1.087a14.843 14.843 0 0 1 3.15-1.163 13.755 13.755 0 0 1 3.25-.387c1.1 0 2.184.129 3.25.387 1.067.258 2.117.646 3.15 1.163.484.25.871.612 1.163 1.087.291.475.437.996.437 1.563v2.8h-16Z"
      />
    </g>
  </svg>
);
export default Person;
