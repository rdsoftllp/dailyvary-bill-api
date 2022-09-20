import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { FirebaseDateTransforrmer } from 'src/common/utils';
import { BillItemEntity } from './bill-item.entity';

class BillItemCollection extends Array<BillItemEntity> { }

export class BillEntity {
  id: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  createdBy: string;
  billNo: string;
  pdfUrl?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  date?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  createdAt?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  updatedAt?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  pdfCreatedAt?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  pdfExpiresAt?: string;

  @Transform((param) => FirebaseDateTransforrmer(param.value))
  deletedAt?: string;
  serviceCharge: number;
  total: number;
  discount?: number;
  discountText?: string;
  originalFileName?: string;

  @Type(() => BillItemEntity)
  @Transform((param) =>
    param.value.map((biEntity) => new BillItemEntity(biEntity)),
  )
  items: BillItemCollection;

  constructor(partial: Partial<BillEntity>) {
    Object.assign(this, partial);
  }
}
