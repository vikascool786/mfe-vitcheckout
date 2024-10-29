import React, { useState } from "react";

interface WithAccordionProps {
  isExpanded: boolean;
  toggleAccordion: () => void;
}

const withAccordion = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithAccordionProps>
) => {
  const AccordionHOC: React.FC<P> = (props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleAccordion = () => setIsExpanded((prev) => !prev);

    return (
      <WrappedComponent
        {...(props as P)}
        isExpanded={isExpanded}
        toggleAccordion={toggleAccordion}
      />
    );
  };

  return AccordionHOC;
};

export default withAccordion;
