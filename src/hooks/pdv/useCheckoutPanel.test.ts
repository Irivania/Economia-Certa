/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCheckoutPanel } from "./useCheckoutPanel";

describe("useCheckoutPanel", () => {
  it("opens payment modal with F9 only when checkout is available", () => {
    const { result } = renderHook(() =>
      useCheckoutPanel({
        totalCart: 10,
        loading: false,
        onCheckout: vi.fn(),
      }),
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "F9" }));
    });
    expect(result.current.isPaymentModalOpen).toBe(true);

    const { result: emptyResult } = renderHook(() =>
      useCheckoutPanel({
        totalCart: 0,
        loading: false,
        onCheckout: vi.fn(),
      }),
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "F9" }));
    });
    expect(emptyResult.current.isPaymentModalOpen).toBe(false);
  });

  it("closes the modal and forwards confirmed payment", () => {
    const onCheckout = vi.fn();
    const { result } = renderHook(() =>
      useCheckoutPanel({
        totalCart: 10,
        loading: false,
        onCheckout,
      }),
    );
    const splits = [{ id: "split-1", method: "CASH" as const, amount: 10 }];

    act(() => {
      result.current.setIsPaymentModalOpen(true);
      result.current.handleConfirmPayment(splits, 2);
    });

    expect(result.current.isPaymentModalOpen).toBe(false);
    expect(onCheckout).toHaveBeenCalledWith(splits, 2);
  });
});
