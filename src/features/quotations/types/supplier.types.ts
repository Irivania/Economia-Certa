export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  selected?: boolean;
}