"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseQuantityQuery } from "@/lib/pdv/parseQuantityQuery";
import type { ProductItem } from "@/types/pdv";

interface UseProductSearchKeyboardOptions {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredProducts: ProductItem[];
  onSelectProduct: (product: ProductItem, customQty?: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function useProductSearchKeyboard({
  searchTerm,
  setSearchTerm,
  filteredProducts,
  onSelectProduct,
  onKeyDown,
}: UseProductSearchKeyboardOptions) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedIndex]);

  const selectProduct = useCallback(
    (product: ProductItem) => {
      const { qty } = parseQuantityQuery(searchTerm);
      onSelectProduct(product, qty);
      setSearchTerm("");
      setSelectedIndex(0);
    },
    [onSelectProduct, searchTerm, setSearchTerm],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const { qty, query } = parseQuantityQuery(searchTerm);
        if (!query && filteredProducts.length === 0) return;

        const target = filteredProducts[selectedIndex] || filteredProducts[0];
        if (target) {
          onSelectProduct(target, qty);
          setSearchTerm("");
          setSelectedIndex(0);
          return;
        }
      }

      if (filteredProducts.length > 0 && searchTerm.trim().length > 0) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((previous) =>
            previous < filteredProducts.length - 1 ? previous + 1 : 0,
          );
          return;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((previous) =>
            previous > 0 ? previous - 1 : filteredProducts.length - 1,
          );
          return;
        }
      }

      onKeyDown(event);
    },
    [
      filteredProducts,
      onKeyDown,
      onSelectProduct,
      searchTerm,
      selectedIndex,
      setSearchTerm,
    ],
  );

  return {
    selectedIndex,
    setSelectedIndex,
    itemRefs,
    handleKeyDown,
    selectProduct,
  };
}
