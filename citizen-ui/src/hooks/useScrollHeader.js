// hooks/useScrollHeader.js
import { useState, useRef, useEffect } from 'react';

export const useScrollHeader = () => {
  const formRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current && formRef.current.scrollTop > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    const formEl = formRef.current;
    if (formEl) {
      formEl.addEventListener("scroll", handleScroll);
      return () => formEl.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return { formRef, scrolled };
};