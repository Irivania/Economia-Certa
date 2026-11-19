import type { PaymentMethodId } from "@/constants/pdvPaymentConstants";

export interface ProductItem {
  id: string;
  description: string;
  ean: string | null;
  salePrice: string | null;
  stockCurrent: number;
  imageUrl: string | null;
  ncm?: string | null;
  classTrib?: string | null;
  unit?: string | null;
  unitOfMeasure?: "UN" | "KG" | "LT" | "CX";
  discountAmount?: number;
  promotionId?: string;
}

export interface CartItem {
  productId: string;
  description: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string | null;
  ncm?: string | null;
  cst?: string | null;
  classTrib?: string | null;
  unit?: string | null;
  unitOfMeasure?: "UN" | "KG" | "LT" | "CX";
  discountAmount?: number;
}

export interface PartnerItem {
  id: string;
  type: "EMPLOYEE" | "COMPANY_PARTNER";
  name: string;
  document: string | null;
  creditLimit: string;
  currentBalance: string;
  discountPercentage: string;
  active: boolean;
}

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
