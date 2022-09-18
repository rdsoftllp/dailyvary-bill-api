import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1000)
  @Max(9999)
  pin: number;
}
