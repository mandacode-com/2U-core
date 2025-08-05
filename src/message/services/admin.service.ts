import { Injectable, NotFoundException } from '@nestjs/common';
import { CredentialService } from 'src/credential/services/credential.service';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: CredentialService,
  ) {}

  /**
   * Retrieves all messages for a given project ID.
   * @param projectId - The ID of the project to retrieve messages for.
   * @returns An array of messages associated with the project.
   */
  async getMessagesByProjectId(projectId: string) {
    return this.prisma.message.findMany({
      select: {
        id: true,
        from: true,
        to: true,
        hint: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Creates a new message for a given project ID.
   * @param data - The data for the new message.
   * @returns The created message object.
   */
  async createMessage(data: {
    projectId: string;
    from?: string;
    to?: string;
    content?: Prisma.InputJsonValue;
    messageId?: string;
    initialPassword?: string;
    hint?: string;
  }) {
    let hashedPassword: string | undefined = undefined;
    if (data.initialPassword) {
      hashedPassword = await this.credentialService.hashPassword(
        data.initialPassword,
      );
    }
    const message = await this.prisma.message.create({
      data: {
        id: data.messageId,
        projectId: data.projectId,
        content: data.content ?? Prisma.JsonNull,
        password: hashedPassword,
        hint: data.hint,
        from: data.from,
        to: data.to,
      },
    });

    return {
      id: message.id,
      from: message.from,
      to: message.to,
      hint: message.hint,
      projectId: message.projectId,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  /**
   * Updates an existing message by its ID.
   * @param data - The data containing the message ID and optional fields to update.
   * @returns The updated message object.
   */
  async updateMessage(data: {
    messageId: string;
    content?: Prisma.InputJsonValue;
    password?: string;
    hint?: string;
    from?: string;
    to?: string;
  }) {
    let hashedPassword: string | undefined = undefined;
    if (data.password) {
      hashedPassword = await this.credentialService.hashPassword(data.password);
    }
    const existingMessage = await this.prisma.message.findUnique({
      where: { id: data.messageId },
    });
    if (!existingMessage) {
      throw new NotFoundException(
        `Message with ID ${data.messageId} not found`,
      );
    }
    await this.prisma.message.update({
      where: { id: data.messageId },
      data: {
        content: data.content ?? existingMessage.content ?? Prisma.JsonNull,
        password: hashedPassword ?? existingMessage.password,
        hint: data.hint ?? existingMessage.hint,
        from: data.from ?? existingMessage.from,
        to: data.to ?? existingMessage.to,
      },
    });
    return;
  }

  /**
   * Deletes a message by its ID.
   * @param messageId - The ID of the message to delete.
   */
  async deleteMessage(messageId: string) {
    await this.prisma.message.delete({
      where: { id: messageId },
    });
    return;
  }

  /**
   * Deletes all messages associated with a given project ID.
   * @param projectId - The ID of the project whose messages should be deleted.
   */
  async deleteMessagesByProjectId(projectId: string) {
    await this.prisma.message.deleteMany({
      where: { projectId },
    });
    return;
  }
}
