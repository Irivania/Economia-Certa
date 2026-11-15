import type { PaymentMethodId } from "@/constants/pdvPaymentConstants";

export interface PaymentSplit {
  id: string;
  method: PaymentMethodId;
  amount: number;
}

export interface NotificationState {
  message: string;
  type: "success" | "error" | "warning" | "info";
}

export interface PDVPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCart: number;
  customerDocument: string;
  setCustomerDocument: (document: string) => void;
  onConfirmPayment: (splits: PaymentSplit[], changeAmount: number) => void;
  isDarkMode: boolean;
  onNotify?: (
    message: string,
    type: "success" | "error" | "warning" | "info",
  ) => void;
}
