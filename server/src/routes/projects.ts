import express from 'express';
import { databaseService } from '../services/databaseService';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get all projects for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = databaseService.getProjectsByUserId(req.user!.id);
    
    res.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get single project
router.get('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = databaseService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user owns this project
    if (project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'Name and slug are required' 
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        error: 'Slug must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Check if slug already exists for this user
    const existingProject = databaseService.getProjectBySlug(req.user!.id, slug);
    if (existingProject) {
      return res.status(400).json({ 
        error: 'A project with this slug already exists' 
      });
    }

    const projectId = databaseService.generateId();
    
    databaseService.createProject({
      id: projectId,
      userId: req.user!.id,
      name,
      slug,
      description
    });

    const project = databaseService.getProjectById(projectId);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, slug, description } = req.body;

    // Check if project exists and user owns it
    const project = databaseService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If slug is being changed, check for conflicts
    if (slug && slug !== project.slug) {
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.status(400).json({ 
          error: 'Slug must contain only lowercase letters, numbers, and hyphens' 
        });
      }

      const existingProject = databaseService.getProjectBySlug(req.user!.id, slug);
      if (existingProject && existingProject.id !== projectId) {
        return res.status(400).json({ 
          error: 'A project with this slug already exists' 
        });
      }
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (slug) updates.slug = slug;
    if (description !== undefined) updates.description = description;

    databaseService.updateProject(projectId, updates);

    const updatedProject = databaseService.getProjectById(projectId);

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:projectId', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Check if project exists and user owns it
    const project = databaseService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    databaseService.deleteProject(projectId);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export { router as projectRoutes };
