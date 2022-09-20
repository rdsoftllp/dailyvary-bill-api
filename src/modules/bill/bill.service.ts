import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { startOfDay, endOfDay, format, add } from 'date-fns';
import { InjectFirebaseAdmin, FirebaseAdmin } from 'nestjs-firebase';
import * as ejs from 'ejs';
import * as path from 'path';
import puppeteer from 'puppeteer';
import { AppResponse } from 'src/common';
import { CollectionFields, CollectionNames, EnvConfig } from 'src/config';
import { UserEntity } from '../user/entities/user.entity';
import { CreateBillPdfDto } from './dto/create-bill-pdf.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { DeleteBillDto } from './dto/delete-bill.dto';
import { FetchBillsDto } from './dto/fetch-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { BillEntity } from './entities/bill.entity';
import { BillListEntity } from './entities/bill.list.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillService {
  private readonly logger = new Logger(BillService.name);
  constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin, private readonly configService: ConfigService) { }

  public async createBill(user: UserEntity, data: CreateBillDto): Promise<AppResponse.ApiResponse<BillEntity>> {
    try {
      const startOfToday = startOfDay(new Date());
      const endOfToday = endOfDay(new Date());
      const existingBills = await this.firebase.db.collection(CollectionNames.BILL)
        .where(CollectionFields.Bill.createdBy, '==', user.email)
        .where(CollectionFields.Bill.date, '>', startOfToday)
        .where(CollectionFields.Bill.date, '<', endOfToday)
        .get()
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
        [CollectionFields.Bill.billNo]: `${format(new Date(), 'yyyy')}${format(new Date(), 'MM')}${format(new Date(), 'dd')}${String((existingBills.size || 0) + 1).padStart(5, '0')}`
      });
      const pdfGenResponse = await this.createBillPdf(user, {
        id: createdBill.id,
      })
      if (pdfGenResponse.success) {
        return AppResponse.ApiSuccessResponse<BillEntity>(new BillEntity({
          ...pdfGenResponse.data,
        }), 'Bill created', HttpStatus.CREATED);
      }
      return pdfGenResponse;
    } catch (error) {
      this.logger.error(`Error while creating bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while creating bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async updateBill(user: UserEntity, data: UpdateBillDto): Promise<AppResponse.ApiResponse<BillEntity>> {
    try {
      const fetchedBill = await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).get()
      if (!fetchedBill.exists || !fetchedBill.data() || fetchedBill.data()[CollectionFields.Bill.createdBy] !== user.email) {
        return AppResponse.ApiErrorResponse(null, 'Invalid bill selected', HttpStatus.BAD_REQUEST)
      }

      let dataToUpdate = Object.assign({}, data);
      delete dataToUpdate.id;

      if (dataToUpdate.discount !== undefined) {
        dataToUpdate[CollectionFields.Bill.discount] = dataToUpdate.discount;
      }

      dataToUpdate = {
        ...fetchedBill.data(),
        ...dataToUpdate,
      }

      const totalItemPrice = dataToUpdate.items.reduce((prev, current) => prev + current.price, 0);
      const finalPrice = totalItemPrice + dataToUpdate.serviceCharge - (dataToUpdate.discount || 0);

      await this.firebase.db.collection(CollectionNames.BILL).doc(data.id).set({
        ...fetchedBill.data(),
        ...dataToUpdate,
        [CollectionFields.Bill.updatedAt]: new Date(),
        [CollectionFields.Bill.total]: parseFloat(finalPrice.toFixed(2)),
        [CollectionFields.Bill.items]: dataToUpdate.items.map(billItem => {
          return {
            ...billItem,
            [CollectionFields.BillItems.price]: parseFloat(billItem.price.toFixed(2)),
          }
        }),
      });

      const pdfGenResponse = await this.createBillPdf(user, {
        id: data.id,
      })
      if (pdfGenResponse.success) {
        return AppResponse.ApiSuccessResponse<BillEntity>(new BillEntity({
          ...pdfGenResponse.data,
        }), 'Bill updated', HttpStatus.CREATED);
      }
      return pdfGenResponse;
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
        .orderBy(CollectionFields.Bill.date, 'desc')
        .get();
      return AppResponse.ApiSuccessResponse<BillListEntity>(new BillListEntity({
        total: bills.size,
        page: filter.page,
        perPage: filter.perPage,
        bills: bills.docs.slice(startAt, (startAt + filter.perPage)).map(bill => new BillEntity({
          ...bill.data(),
          id: bill.id
        })),
      }), 'All bills', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Error while fetching bill ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while fetching bill', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async createBillPdf(user: UserEntity, createBillPdfDto: CreateBillPdfDto): Promise<AppResponse.ApiResponse<BillEntity>> {
    try {
      const fetchedBill = await this.firebase.db.collection(CollectionNames.BILL).doc(createBillPdfDto.id).get()
      if (!fetchedBill.exists || !fetchedBill.data() || fetchedBill.data()[CollectionFields.Bill.createdBy] !== user.email) {
        return AppResponse.ApiErrorResponse(null, 'Invalid bill selected', HttpStatus.BAD_REQUEST)
      }
      if (fetchedBill.data()[CollectionFields.Bill.pdfUrl] && fetchedBill.data()[CollectionFields.Bill.originalFileName]) {
        // delete existing pdf
        await this.firebase.storage.bucket(this.configService.get<string>(EnvConfig.FIREBASE_STORAGE_BUCKET)).file(fetchedBill.data()[CollectionFields.Bill.originalFileName]).delete();
      }
      const renderedHtml = await ejs.renderFile(path.resolve(__dirname, '../../../views/bill-pdf.ejs'));
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(renderedHtml, {
        waitUntil: 'networkidle2'
      });
      await page.evaluate(async () => {
        const selectors = Array.from(document.querySelectorAll("img"));
        await Promise.all(selectors.map(img => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.addEventListener('load', resolve);
            img.addEventListener('error', reject);
          });
        }));
      });
      const fileBuffer = await page.pdf({ format: 'A4' });
      const fileName = `bills/${fetchedBill.data()[CollectionFields.Bill.billNo]}.pdf`
      await this.firebase.storage.bucket(this.configService.get<string>(EnvConfig.FIREBASE_STORAGE_BUCKET)).file(fileName).save(fileBuffer, {
        contentType: 'application/pdf'
      })
      const fileUrlExpiresAt = add(new Date(), {
        years: 2,
      })
      const uploadedFile = await this.firebase.storage.bucket(this.configService.get<string>(EnvConfig.FIREBASE_STORAGE_BUCKET)).file(fileName).getSignedUrl({
        action: 'read',
        expires: fileUrlExpiresAt
      });
      await this.firebase.db.collection(CollectionNames.BILL).doc(createBillPdfDto.id).update({
        [CollectionFields.Bill.pdfUrl]: uploadedFile,
        [CollectionFields.Bill.pdfCreatedAt]: new Date(),
        [CollectionFields.Bill.pdfExpiresAt]: fileUrlExpiresAt,
        [CollectionFields.Bill.originalFileName]: fileName,
      })
      const updatedBill = await this.firebase.db.collection(CollectionNames.BILL).doc(createBillPdfDto.id).get();
      return AppResponse.ApiSuccessResponse<BillEntity>(new BillEntity({
        ...updatedBill.data(),
        id: updatedBill.id,
      }), 'PDF generated', HttpStatus.CREATED);
    } catch (error) {
      this.logger.error(`Error while creating bill pdf ${error}`)
      return AppResponse.ApiErrorResponse(null, 'Error while creating bill pdf', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
