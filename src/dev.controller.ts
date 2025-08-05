import {
  Controller,
  Get,
  HttpCode,
  Logger,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from './common/decorators/user.decorator';
import { AuthGuard } from './common/guards/auth.guard';

@Controller('/dev')
export class DevController {
  @Get('/gateway-feedback/headers')
  @HttpCode(200)
  getHeaderValues(@Req() req: Request) {
    Logger.log(
      `Headers: ${JSON.stringify(req.rawHeaders, null, 2)}`,
      'DevController',
    );

    return {
      message: 'header list has been printed on the console',
    };
  }

  @Get('/gateway-feedback/uuid')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  getUuid(@User('uuid') uuid: string) {
    Logger.log(`UUID: ${uuid}`, 'DevController');

    return {
      message: 'uuid has been printed on the console',
    };
  }
}
