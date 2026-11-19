/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useProductSearchKeyboard } from "./useProductSearchKeyboard";
import type { ProductItem } from "@/types/pdv";

const products: ProductItem[] = [
  {
    id: "1",
    description: "Produto 1",
    ean: "123",
    salePrice: "10",
    stockCurrent: 10,
    imageUrl: null,
  },
  {
    id: "2",
    description: "Produto 2",
    ean: "456",
    salePrice: "20",
    stockCurrent: 10,
    imageUrl: null,
  },
];

describe("useProductSearchKeyboard", () => {
  it("navigates down and wraps up", () => {
    const setSearchTerm = vi.fn();
    const { result } = renderHook(() =>
      useProductSearchKeyboard({
        searchTerm: "produto",
        setSearchTerm,
        filteredProducts: products,
        onSelectProduct: vi.fn(),
        onKeyDown: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.selectedIndex).toBe(1);

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.selectedIndex).toBe(0);

    act(() => {
      result.current.handleKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });
    expect(result.current.selectedIndex).toBe(1);
  });

  it("selects the highlighted product with the parsed quantity", () => {
    const onSelectProduct = vi.fn();
    const setSearchTerm = vi.fn();
    const { result } = renderHook(() =>
      useProductSearchKeyboard({
        searchTerm: "4*123",
        setSearchTerm,
        filteredProducts: products,
        onSelectProduct,
        onKeyDown: vi.fn(),
      }),
    );

    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    expect(onSelectProduct).toHaveBeenCalledWith(products[0], 4);
    expect(setSearchTerm).toHaveBeenCalledWith("");
    expect(result.current.selectedIndex).toBe(0);
  });
});
