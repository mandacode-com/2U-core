import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProjectGuard } from 'src/common/guards/project.guard';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod_validation.pipe';
import {
  CreateMessageBody,
  createMessageBodySchema,
  UpdateMessageBody,
  updateMessageBodySchema,
} from '../schemas/admin.schema';
import { MessageAdminService } from '../services/admin.service';

@Controller('admin/message')
export class MessageAdminController {
  constructor(private readonly adminService: MessageAdminService) {}

  @Get('list/:projectId')
  @UseGuards(AuthGuard, ProjectGuard)
  async getMessagesByProjectId(@Param('projectId') projectId: string) {
    const info = await this.adminService.getMessagesByProjectId(projectId);
    return info.map((message) => ({
      id: message.id,
      from: message.from,
      to: message.to,
      hint: message.hint,
      projectId: message.projectId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    }));
  }

  @Post(':projectId')
  @UseGuards(AuthGuard, ProjectGuard)
  async createMessage(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(createMessageBodySchema))
    body: CreateMessageBody,
  ) {
    const message = await this.adminService.createMessage({
      projectId,
      content: body.content,
      messageId: body.messageId,
      initialPassword: body.initialPassword,
      from: body.from,
      to: body.to,
    });
    return {
      id: message.id,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      hint: message.hint,
      from: message.from,
      to: message.to,
    };
  }

  @Patch(':messageId')
  @UseGuards(AuthGuard, ProjectGuard)
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body(new ZodValidationPipe(updateMessageBodySchema))
    body: UpdateMessageBody,
  ) {
    return this.adminService.updateMessage({
      messageId,
      content: body.content,
      password: body.password,
      hint: body.hint,
      from: body.from,
      to: body.to,
    });
  }

  @Delete(':projectId/:messageId')
  @UseGuards(AuthGuard, ProjectGuard)
  async deleteMessage(@Param('messageId') messageId: string) {
    await this.adminService.deleteMessage(messageId);
    return { message: 'Message deleted successfully' };
  }

  @Delete(':projectId')
  @UseGuards(AuthGuard, ProjectGuard)
  async deleteMessagesByProjectId(@Param('projectId') projectId: string) {
    await this.adminService.deleteMessagesByProjectId(projectId);
    return { message: 'Messages deleted successfully' };
  }
}
