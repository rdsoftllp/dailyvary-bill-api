import { IsNotEmpty, IsString } from "class-validator";

export class CreateBillPdfDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
