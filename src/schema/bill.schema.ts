export type BillItem = {
  name: string;
  quantity?: string;
  price: number;
}

export type Bill = {
  id: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  createdBy: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  serviceCharge: number;
  total: number;
  discount?: number;
  discountText?: string;
  items: BillItem[];
}
