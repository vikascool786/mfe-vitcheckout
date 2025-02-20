import { useFormikContext } from "formik";
import React, { Ref, useEffect, useRef } from "react";

const findFirstErrorKey = (obj: any, path = ""): string | null => {
  for (const key in obj) {
    const newPath = path ? `${path}.${key}` : key;
    if (typeof obj[key] === "string") return newPath; // If error is a string, return path
    if (typeof obj[key] === "object") {
      const nestedError = findFirstErrorKey(obj[key], newPath);
      if (nestedError) return nestedError;
    }
  }
  return null;
};

interface ScrollToErrorProps {
  errorRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
}
const ScrollToError: React.FC<ScrollToErrorProps> = ({ errorRefs }) => {
  const { errors, isSubmitting, isValidating } = useFormikContext();

  useEffect(() => {
    if (isSubmitting && !isValidating) {
      const firstErrorKey = findFirstErrorKey(errors);
      if (firstErrorKey) {
        errorRefs?.current[firstErrorKey]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [errors, isSubmitting, isValidating]);
  return null;
};
export default ScrollToError;
