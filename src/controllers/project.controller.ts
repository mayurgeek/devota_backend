import { Request, Response } from 'express';
import * as projectModel from '../models/project.model';

export async function getAllProjects(req: Request, res: Response): Promise<void> {
  try {
    const projects = await projectModel.getAllProjects();
    res.status(200).json({ success: true, projects });
  } catch (error) {
    console.error('Error getting all projects:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const { project_id, name, status = 'allowed' } = req.body;

    // Validate required fields
    if (!project_id || !name) {
      res.status(400).json({ success: false, message: 'Project ID and name are required' });
      return;
    }

    // Check if project already exists
    const existingProject = await projectModel.getProjectByProjectId(project_id);
    if (existingProject) {
      res.status(409).json({ success: false, message: 'Project ID already in use' });
      return;
    }

    // Create new project
    const projectData = { project_id, name, status: status as 'allowed' | 'blocked' };
    const projectId = await projectModel.createProject(projectData);

    // Fetch the created project
    const project = await projectModel.getProjectById(projectId);

    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function blockProject(req: Request, res: Response): Promise<void> {
  try {
    const { project_id } = req.body;

    // Validate required fields
    if (!project_id) {
      res.status(400).json({ success: false, message: 'Project ID is required' });
      return;
    }

    // Check if project exists
    const existingProject = await projectModel.getProjectByProjectId(project_id);
    if (!existingProject) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Block the project
    const success = await projectModel.setProjectStatus(project_id, 'blocked');

    if (success) {
      res.status(200).json({ success: true, message: 'Project blocked successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to block project' });
    }
  } catch (error) {
    console.error('Error blocking project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function unblockProject(req: Request, res: Response): Promise<void> {
  try {
    const { project_id } = req.body;

    // Validate required fields
    if (!project_id) {
      res.status(400).json({ success: false, message: 'Project ID is required' });
      return;
    }

    // Check if project exists
    const existingProject = await projectModel.getProjectByProjectId(project_id);
    if (!existingProject) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    // Unblock the project
    const success = await projectModel.setProjectStatus(project_id, 'allowed');

    if (success) {
      res.status(200).json({ success: true, message: 'Project unblocked successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to unblock project' });
    }
  } catch (error) {
    console.error('Error unblocking project:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

export async function checkAccess(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, name, status = 'allowed' } = req.params;

    // Validate required fields
    if (!projectId) {
      res.status(400).json({ success: false, message: 'Project ID is required' });
      return;
    }

    let project
    project = await projectModel.getProjectByProjectId(projectId);

    // If project doesn't exist, deny access
    if (!project) {
      // res.status(200).json({ success: true, allowed: false, message: 'Project not registered' });
      // return;
      
    // Create new project
      const projectData = { project_id: projectId, name, status: status as 'allowed' | 'blocked' };
      await projectModel.createProject(projectData);
    // Fetch the created project  
      project = await projectModel.getProjectByProjectId(projectId);
    }

    // Check if project is allowed to run
    const allowed = project?.status === 'allowed';

    res.status(200).json({
      success: true,
      allowed,
      message: allowed ? 'Access granted' : 'Access denied'
    });
  } catch (error) {
    console.error('Error checking access:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
} 