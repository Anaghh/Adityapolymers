"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Legacy anchor shim: the old static site linked catalog sections as
 * aditya-polymers-products.html#packagingadhesives etc. Anchor fragments
 * never reach the server, so when one of those URLs lands on /products this
 * client island forwards the hash to the matching catalog route.
 */
const HASH_ROUTES: Record<string, string> = {
  syntheticadhesives: "/products/synthetic",
  packagingadhesives: "/products/packaging",
  paperconversionadhesives: "/products/paper-conversion",
  laminationadhesives: "/products/lamination",
  labelingadhesives: "/products/labeling",
  starchbasedadhesives: "/products/starch-based-dextrin",
  woodworkingadhesives: "/products/wood-working",
};

export function HashShim() {
  const router = useRouter();

  useEffect(() => {
    const key = window.location.hash.replace(/^#/, "").trim().toLowerCase();
    const target = HASH_ROUTES[key];
    if (target) router.replace(target);
  }, [router]);

  return null;
}
