import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserData } from 'src/decorators/user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { DeleteBillDto } from './dto/delete-bill.dto';
import { FetchBillsDto } from './dto/fetch-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) { }

  @Post('create')
  async createBill(@UserData() user: UserEntity, @Body() data: CreateBillDto) {
    return this.billService.createBill(user, data);
  }

  @Post('update')
  async updateBill(@UserData() user: UserEntity, @Body() data: UpdateBillDto) {
    return this.billService.updateBill(user, data);
  }

  @Post('delete')
  async deleteBill(@UserData() user: UserEntity, @Body() data: DeleteBillDto) {
    return this.billService.deleteBill(user, data);
  }

  @Post('fetch')
  async fetchBills(@UserData() user: UserEntity, @Body() filter: FetchBillsDto) {
    return this.billService.fetchBills(user, filter);
  }
}
