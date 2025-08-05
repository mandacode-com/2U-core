import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CredentialService } from 'src/credential/services/credential.service';
import { PrismaService } from 'src/prisma/services/prisma.service';

@Injectable()
export class MessageUserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly credentialService: CredentialService,
  ) {}

  /**
   * @description Retrieves information about a message by its ID.
   * @param messageId - The ID of the message to retrieve.
   * @returns The message information including id, createdAt, updatedAt, and hint.
   */
  async getMessageInfo(messageId: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          hint: true,
          from: true,
          to: true,
        },
      });
      if (!message) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }

      return message;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * @description Reads a message by its ID.
   * @param messageId - The ID of the message to read.
   * @param password - Optional password to access the message.
   * @returns The message content and metadata if accessible.
   */
  async readMessage(messageId: string, password?: string) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });
      if (!message) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }
      if (message.password) {
        if (!password) {
          throw new UnauthorizedException(
            'This message is password protected. Please provide a password.',
          );
        }
        const isValidPassword = await this.credentialService.comparePasswords(
          password,
          message.password,
        );
        if (!isValidPassword) {
          throw new UnauthorizedException(
            'Invalid password. Please try again.',
          );
        }
      }

      return {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        from: message.from,
        to: message.to,
        hint: message.hint,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Update the password for a message.
   * @param data - The data containing the message ID, current password, new password, and optional new hint.
   */
  async updatePassword(data: {
    messageId: string;
    currentPassword: string;
    newPassword: string;
    newHint?: string;
  }) {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: data.messageId },
      });
      if (!message) {
        throw new NotFoundException(
          `Message with ID ${data.messageId} not found`,
        );
      }
      if (!message.password) {
        throw new UnauthorizedException(
          'This message does not have a password set.',
        );
      }
      const isValidPassword = await this.credentialService.comparePasswords(
        data.currentPassword,
        message.password,
      );
      if (!isValidPassword) {
        throw new UnauthorizedException('Invalid current password.');
      }

      const hashedNewPassword = await this.credentialService.hashPassword(
        data.newPassword,
      );

      await this.prisma.message.update({
        omit: {
          content: true,
          password: true,
        },
        where: { id: data.messageId },
        data: { password: hashedNewPassword, hint: data.newHint },
      });
      return;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Message with ID ${data.messageId} not found`,
          );
        }
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * @description Updates a message by its ID.
   * @param data - The data containing the message ID and optional fields to update.
   */
  async updateMessage(data: {
    messageId: string;
    content?: Prisma.InputJsonValue;
    password?: string;
    hint?: string;
    from?: string;
    to?: string;
  }) {
    try {
      const existingMessage = await this.prisma.message.findUnique({
        where: { id: data.messageId },
      });
      if (!existingMessage) {
        throw new NotFoundException(
          `Message with ID ${data.messageId} not found`,
        );
      }

      let hashedPassword: string | undefined = undefined;
      if (data.password) {
        hashedPassword = await this.credentialService.hashPassword(
          data.password,
        );
      }

      await this.prisma.message.update({
        omit: {
          content: true,
          password: true,
        },
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
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Message with ID ${data.messageId} not found`,
          );
        }
      }
      throw error; // Re-throw other errors
    }
  }

  /**
   * Verifies the password for a message.
   * @param messageId - The ID of the message to verify.
   * @param password - The password to verify against the message.
   * @returns True if the password matches, false otherwise.
   */
  async verifyMessagePassword(
    messageId: string,
    password?: string,
  ): Promise<boolean> {
    try {
      const message = await this.prisma.message.findUnique({
        where: { id: messageId },
      });
      if (!message) {
        throw new NotFoundException(`Message with ID ${messageId} not found`);
      }
      if (!message.password) {
        return true; // No password set, access granted
      }
      if (!password) {
        throw new UnauthorizedException(
          'This message is password protected. Please provide a password.',
        );
      }
      return this.credentialService.comparePasswords(
        password,
        message.password,
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Message with ID ${messageId} not found`);
        }
      }
      throw error; // Re-throw other errors
    }
  }
}
