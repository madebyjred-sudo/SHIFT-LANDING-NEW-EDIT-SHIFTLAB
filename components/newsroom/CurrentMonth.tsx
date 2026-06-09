"use client";

import { useEffect, useState } from "react";

export default function CurrentMonth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a generic fallback or empty space to avoid hydration mismatch
    return <span>&nbsp;</span>;
  }

  return (
    <span>
      {new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
    </span>
  );
}
