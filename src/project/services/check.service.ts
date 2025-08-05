import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/services/prisma.service';

@Injectable()
export class ProjectCheckService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Checks if a project exists by its ID.
   * @param projectId - The ID of the project to check.
   * @returns A boolean indicating whether the project exists.
   */
  async checkProjectExists(projectId: string): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: { id: projectId },
    });
    return !!project;
  }

  /**
   * Check if a project is accessible by user id
   * @param projectId - The ID of the project to check.
   * @param userId - The ID of the user to check against.
   * @return A boolean indicating whether the project is accessible by the user.
   */
  async checkProjectAccessibleByUserId(
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      select: { id: true },
      where: {
        id: projectId,
        adminId: userId,
      },
    });
    return !!project;
  }
}
