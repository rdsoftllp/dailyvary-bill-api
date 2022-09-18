export class BillItemEntity {
  name: string;
  quantity?: string;
  price: number;

  constructor(partial: Partial<BillItemEntity>) {
    Object.assign(this, partial);
  }
}
