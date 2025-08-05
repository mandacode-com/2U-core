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
import { ProjectService } from '../services/project.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { ProjectGuard } from 'src/common/guards/project.guard';
import { User } from 'src/common/decorators/user.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod_validation.pipe';
import {
  CreateProjectBody,
  createProjectBodySchema,
  UpdateProjectBody,
  updateProjectBodySchema,
} from '../schemas/project.schema';

@Controller('project')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('list/all')
  async getProjectsByAdminId(@User('uuid') uuid: string) {
    return this.projectService.getProjectsByAdminId(uuid);
  }

  @Get(':projectId')
  @UseGuards(ProjectGuard)
  async getProjectById(@Param('projectId') projectId: string) {
    return this.projectService.getProjectById(projectId);
  }

  @Post('')
  async createProject(
    @Body(new ZodValidationPipe(createProjectBodySchema))
    body: CreateProjectBody,
    @User('uuid') adminId: string,
  ) {
    return this.projectService.createProject(body.name, adminId);
  }

  @Patch('update/:projectId')
  @UseGuards(ProjectGuard)
  async updateProject(
    @Param('projectId') projectId: string,
    @Body(new ZodValidationPipe(updateProjectBodySchema))
    body: UpdateProjectBody,
  ) {
    return this.projectService.updateProject(projectId, body.name);
  }

  @Delete(':projectId')
  @UseGuards(ProjectGuard)
  async deleteProject(@Param('projectId') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }
}
