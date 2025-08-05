import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UserRequest } from '../interfaces/user.interface';
import { ProjectCheckService } from 'src/project/services/check.service';

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private readonly projectCheckService: ProjectCheckService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();

    const projectId = request.params.projectId;

    if (!projectId) {
      Logger.error(
        'ProjectGuard: No projectId found in request parameters',
        'ProjectGuard',
      );
      throw new UnauthorizedException('Project ID is required');
    }
    const hasAccess =
      await this.projectCheckService.checkProjectAccessibleByUserId(
        projectId,
        request.user.uuid,
      );

    if (!hasAccess) {
      Logger.error(
        `ProjectGuard: User ${request.user.uuid} does not have access to project ${projectId}`,
        'ProjectGuard',
      );
      throw new UnauthorizedException('Access denied for this project');
    }

    // If the user has access, allow the request to proceed
    return true;
  }
}
