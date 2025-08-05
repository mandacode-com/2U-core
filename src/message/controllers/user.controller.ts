import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/common/pipes/zod_validation.pipe';
import {
  ReadMessageBody,
  readMessageBodySchema,
  UpdateMessageBody,
  updateMessageBodySchema,
  UpdatePasswordBody,
  updatePasswordBodySchema,
  UploadImageBody,
  uploadImageBodySchema,
} from '../schemas/user.schema';
import { MessageUserService } from '../services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from 'src/storage/services/storage.service';
import { Response } from 'express';
import { messageStorageName } from 'src/common/storage_path';

@Controller('message')
export class MessageUserController {
  constructor(
    private readonly readService: MessageUserService,
    private readonly storageService: StorageService,
  ) {}

  @Get(':messageId')
  async getMessageInfo(@Param('messageId') messageId: string) {
    const info = await this.readService.getMessageInfo(messageId);
    return {
      id: info.id,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      hint: info.hint,
      from: info.from,
      to: info.to,
    };
  }

  @Post(':messageId')
  async readMessage(
    @Param('messageId') messageId: string,
    @Body(new ZodValidationPipe(readMessageBodySchema)) body: ReadMessageBody,
  ) {
    const message = await this.readService.readMessage(
      messageId,
      body.password,
    );
    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      hint: message.hint,
      from: message.from,
      to: message.to,
    };
  }

  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body(new ZodValidationPipe(updateMessageBodySchema))
    body: UpdateMessageBody,
  ) {
    await this.readService.updateMessage({
      messageId,
      content: body.content,
      password: body.password,
      hint: body.hint,
      from: body.from,
      to: body.to,
    });

    return {
      message: 'Message updated successfully',
    };
  }

  @Patch(':messageId/password')
  async updateMessagePassword(
    @Param('messageId') messageId: string,
    @Body(new ZodValidationPipe(updatePasswordBodySchema))
    body: UpdatePasswordBody,
  ) {
    await this.readService.updatePassword({
      messageId,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      newHint: body.newHint,
    });
    return {
      message: 'Password updated successfully',
    };
  }

  @Get(':messageId/image')
  getMessageImage(@Param('messageId') messageId: string, @Res() res: Response) {
    const stream = this.storageService.downloadFile(
      messageStorageName,
      messageId,
    );

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${messageId}"`);

    stream.pipe(res);
  }

  @Post(':messageId/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('messageId') messageId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body(new ZodValidationPipe(uploadImageBodySchema)) body: UploadImageBody,
  ) {
    const verifyResult = await this.readService.verifyMessagePassword(
      messageId,
      body.password,
    );
    if (!verifyResult) {
      throw new UnauthorizedException(
        'This message is password protected. Please provide a valid password.',
      );
    }

    await this.storageService.uploadFile(file, messageStorageName, messageId);
    return {
      message: 'Image uploaded successfully',
      fileName: file.originalname,
    };
  }
}
