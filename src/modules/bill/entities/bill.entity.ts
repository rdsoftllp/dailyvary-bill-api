import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { BillItemEntity } from './bill-item.entity';

class BillItemCollection extends Array<BillItemEntity> { }

export class BillEntity {
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

  @Type(() => BillItemEntity)
  @Transform((param) =>
    param.value.map((biEntity) => new BillItemEntity(biEntity)),
  )
  items: BillItemCollection;

  constructor(partial: Partial<BillEntity>) {
    Object.assign(this, partial);
  }
}
