import { IsNotEmpty, IsString } from "class-validator";

export class DeleteBillDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
