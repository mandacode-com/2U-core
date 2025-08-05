import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Project } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/services/prisma.service';
import { MessageAdminService } from 'src/message/services/admin.service';

@Injectable()
export class ProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messageAdminService: MessageAdminService,
  ) {}

  /**
   * Checks if a project exists by its name.
   * @param name - The name of the project to check.
   * @param adminId - The ID of the admin to check against.
   */
  async createProject(name: string, adminId: string): Promise<void> {
    try {
      await this.prisma.project.create({
        data: {
          name,
          adminId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Project with name "${name}" already exists.`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Retrieves a project by its ID.
   * @param projectId - The ID of the project to retrieve.
   * @returns The project object if found.
   */
  async getProjectById(projectId: string): Promise<Project> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new NotFoundException(`Project with ID ${projectId} not found.`);
      }

      return project;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Project with ID ${projectId} not found.`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Retrieves all projects associated with a specific admin ID.
   * @param adminId - The ID of the admin whose projects to retrieve.
   * @returns An array of projects associated with the admin.
   */
  async getProjectsByAdminId(adminId: string): Promise<Project[]> {
    try {
      const projects = await this.prisma.project.findMany({
        where: { adminId },
      });

      return projects;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `No projects found for admin with ID ${adminId}.`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Deletes a project by its ID.
   * @param projectId - The ID of the project to delete.
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      await this.messageAdminService.deleteMessagesByProjectId(projectId); // Delete all messages associated with the project
      await this.prisma.project.delete({
        where: { id: projectId },
      }); // Delete the project itself
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Project with ID ${projectId} not found.`,
          );
        }
      }

      throw error;
    }
  }

  /**
   * Updates a project by its ID.
   * @param projectId - The ID of the project to update.
   * @param name - The new name of the project (optional).
   * @param adminId - The new admin ID for the project (optional).
   */
  async updateProject(
    projectId: string,
    name?: string,
    adminId?: string,
  ): Promise<void> {
    try {
      await this.prisma.project.update({
        where: { id: projectId },
        data: {
          name,
          adminId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(
            `Project with ID ${projectId} not found.`,
          );
        }
      }

      throw error;
    }
  }
}
