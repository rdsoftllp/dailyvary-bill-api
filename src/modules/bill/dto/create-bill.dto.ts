import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsOptional, Min, MinLength, MaxLength, IsDateString, ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';

export class BillItemDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  name: string;

  @IsOptional()
  @IsString()
  quantity?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;
}

export class BillDto {
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerAddress?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  serviceCharge: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  discountText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @Type(() => BillItemDto)
  items: BillItemDto[];
}

export class CreateBillDto extends BillDto { }
