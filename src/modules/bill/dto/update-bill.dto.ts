import { IsNotEmpty, IsString } from "class-validator";
import { BillDto } from "./create-bill.dto";

export class UpdateBillDto extends BillDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
