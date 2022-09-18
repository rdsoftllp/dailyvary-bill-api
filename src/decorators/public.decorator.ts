import { SetMetadata } from '@nestjs/common';
import { DecoratorKeys } from 'src/config';

export const Public = () => SetMetadata(DecoratorKeys.IS_PUBLIC, true);
