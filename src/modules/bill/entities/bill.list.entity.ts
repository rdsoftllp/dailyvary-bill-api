import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { BillEntity } from './bill.entity';

class BillCollection extends Array<BillEntity> { }

export class BillListEntity {
  @Type(() => BillEntity)
  @Transform((param) =>
    param.value.map((billEntity) => new BillEntity(billEntity)),
  )
  bills: BillCollection;

  total: number;
  page: number;
  perPage: number;

  constructor(partial: Partial<BillListEntity>) {
    Object.assign(this, partial);
  }
}
