import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectFirebaseAdmin, FirebaseAdmin } from 'nestjs-firebase';
import { AppResponse } from 'src/common';
import { CollectionFields, CollectionNames } from 'src/config';
import { User } from 'src/schema/user.schema';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(@InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin) { }

  public async findUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.firebase.db.collection(CollectionNames.USER).where(CollectionFields.User.email, '==', email).get();
      if (user.size !== 1) {
        return null;
      }
      const userDoc = user.docs[0];
      return new UserEntity({
        id: userDoc.id,
        name: userDoc.data()[CollectionFields.User.name],
        email: userDoc.data()[CollectionFields.User.email],
        phone: userDoc.data()[CollectionFields.User.phone],
        pin: userDoc.data()[CollectionFields.User.pin],
      })
    } catch (error) {
      this.logger.error(`Error while fetching user by email`, error);
      return null;
    }
  }

  public async findUserByPin(pin: number): Promise<User | null> {
    try {
      const user = await this.firebase.db.collection(CollectionNames.USER).where(CollectionFields.User.pin, '==', pin).get();
      if (user.size !== 1) {
        return null;
      }
      const userDoc = user.docs[0];
      return new UserEntity({
        id: userDoc.id,
        name: userDoc.data()[CollectionFields.User.name],
        email: userDoc.data()[CollectionFields.User.email],
        phone: userDoc.data()[CollectionFields.User.phone],
        pin: userDoc.data()[CollectionFields.User.pin],
      })
    } catch (error) {
      this.logger.error(`Error while fetching user by pin`, error);
      return null;
    }
  }

  public async getUserProfile(email: string) {
    try {
      const user = await this.findUserByEmail(email);
      return AppResponse.ApiSuccessResponse(user, 'User profile', HttpStatus.OK);
    } catch (error) {
      this.logger.error(`Error while fetching user by pin`, error);
      return AppResponse.ApiErrorResponse(null, 'Unable to fetch user profile', HttpStatus.BAD_REQUEST)
    }
  }
}
