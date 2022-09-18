import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectFirebaseAdmin, FirebaseAdmin } from 'nestjs-firebase';
import { AppResponse } from 'src/common';
import { CollectionFields, CollectionNames } from 'src/config';
import { UserEntity } from '../user/entities/user.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { DeleteBillDto } from './dto/delete-bill.dto';
import { FetchBillsDto } from './dto/fetch-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { BillEntity } from './entities/bill.entity';
import { BillListEntity } from './entities/bill.list.entity';

@Injectable()
export class BillService {
  private readonly logger = new Logger(BillService.name);
  constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) { }

  public async createBill(user: UserEntity, data: CreateBillDto): Promise<AppResponse.ApiResponse<BillEntity>> {
    try {
      const totalItemPrice = data.items.reduce((prev, current) => prev + current.price, 0);
      const finalPrice = totalItemPrice + data.serviceCharge - (data.discount || 0);
      const createdBill = await this.firebase.db.collection(CollectionNames.BILL).add({
        ...data,
        [CollectionFields.Bill.createdBy]: user.email,
        [CollectionFields.Bill.createdAt]: new Date(),
        [CollectionFields.Bill.date]: data.date ? new Date(data.date) : new Date(),
        [CollectionFields.Bill.total]: parseFloat(finalPrice.toFixed(2)),
        [CollectionFields.Bill.items]: data.items.map(billItem => {
          return {
            ...billItem,
            [CollectionFields.BillItems.price]: parseFloat(billItem.price.toFixed(2)),
          }
        }),
        [CollectionFields.Bill.discount]: data.discount ? parseFloat(data.discount.toFixed(2)) : 0,
      });
      return AppResponse.ApiSuccessResponse<BillEntity>(new BillEntity({
        ...(await createdBill.get()).data(),
        id: createdBill.id,
      }), 'Bill created', HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(`Error while creating bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while creating bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateBill(user: UserEntity, data: UpdateBillDto): Promise<AppResponse.ApiResponse<BillEntity>> {
    try {
      const totalItemPrice = data.items.reduce((prev, current) => prev + current.price, 0);
      const finalPrice = totalItemPrice + data.serviceCharge - (data.discount || 0);

      const dataToUpdate = Object.assign({}, data);
      delete dataToUpdate.id;

      await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).set({
        ...dataToUpdate,
        [CollectionFields.Bill.createdBy]: user.email,
        [CollectionFields.Bill.updatedAt]: new Date(),
        [CollectionFields.Bill.date]: dataToUpdate.date ? new Date(dataToUpdate.date) : new Date(),
        [CollectionFields.Bill.total]: parseFloat(finalPrice.toFixed(2)),
        [CollectionFields.Bill.items]: dataToUpdate.items.map(billItem => {
          return {
            ...billItem,
            [CollectionFields.BillItems.price]: parseFloat(billItem.price.toFixed(2)),
          }
        }),
        [CollectionFields.Bill.discount]: dataToUpdate.discount ? parseFloat(dataToUpdate.discount.toFixed(2)) : 0,
      });

      const updatedBill = await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).get()

      return AppResponse.ApiSuccessResponse<BillEntity>(new BillEntity({
        ...updatedBill.data(),
        id: updatedBill.id,
      }), 'Bill updated', HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(`Error while updating bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while updating bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteBill(user: UserEntity, data: DeleteBillDto): Promise<AppResponse.ApiResponse> {
    try {
      const fetchedBill = await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).get()
      if (fetchedBill.data()[CollectionFields.Bill.createdBy] !== user.email) {
        return AppResponse.ApiErrorResponse(null, 'Invalid bill to delete', HttpStatus.BAD_REQUEST)
      }
      await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).delete();
      return AppResponse.ApiSuccessResponse(null, 'Bill deleted', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Error while deleting bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while deleting bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async fetchBills(user: UserEntity, filter: FetchBillsDto): Promise<AppResponse.ApiResponse<BillListEntity>> {
    try {
      const startAt = (filter.page - 1) * filter.perPage;
      const bills = await this.firebase.db.collection(CollectionNames.BILL)
        .where(CollectionFields.Bill.createdBy, '==', user.email)
        .orderBy(CollectionFields.Bill.createdAt, 'desc')
        .startAt(startAt)
        .limit(filter.perPage)
        .get();
      return AppResponse.ApiSuccessResponse<BillListEntity>(new BillListEntity({
        total: bills.size,
        page: filter.page,
        perPage: filter.perPage,
        bills: bills.docs.map(bill => new BillEntity(bill)),
      }), 'All bills', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Error while fetching bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while fetching bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
