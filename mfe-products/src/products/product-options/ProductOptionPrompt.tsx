import React, { useRef, useState, useEffect } from "react";
import "./ProductOptions.scss";

interface ProductOptionPromptProps {
  prompt: string;
}
const ProductOptionPrompt: React.FC<ProductOptionPromptProps> = ({
  prompt = "",
}) => {
  const promptRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (promptRef.current) {
      if (promptRef.current.scrollHeight > promptRef.current.clientHeight) {
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    }
  }, [promptRef.current]);

  return (
    <div style={{ display: "inline-block", position: "relative" }}>
      <span
        className="option-prompt"
        ref={promptRef}
        dangerouslySetInnerHTML={{
          __html: prompt,
        }}
      ></span>

      {showTooltip && (
        <span
          className="option-prompt-tooltip"
          dangerouslySetInnerHTML={{
            __html: prompt,
          }}
        ></span>
      )}
    </div>
  );
};
export default ProductOptionPrompt;
