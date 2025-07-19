import pool from './database';

export interface Project {
  id?: number;
  project_id: string;
  name: string;
  status: 'allowed' | 'blocked';
  created_at?: Date;
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const [rows] = await pool.execute('SELECT * FROM projects ORDER BY created_at DESC');
    return rows as Project[];
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

export async function getProjectById(id: number): Promise<Project | null> {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    return rows.length ? rows[0] as Project : null;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    throw error;
  }
}

export async function getProjectByProjectId(projectId: string): Promise<Project | null> {
  try {
    const [rows]: any = await pool.execute('SELECT * FROM projects WHERE project_id = ?', [projectId]);
    return rows.length ? rows[0] as Project : null;
  } catch (error) {
    console.error('Error fetching project by project ID:', error);
    throw error;
  }
}

export async function createProject(project: Project): Promise<number> {
  try {
    const [result]: any = await pool.execute(
      'INSERT INTO projects (project_id, name, status) VALUES (?, ?, ?)',
      [project.project_id, project.name, project.status]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function updateProject(id: number, project: Partial<Project>): Promise<boolean> {
  try {
    const fields = Object.keys(project)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => `${key} = ?`);
    
    if (fields.length === 0) return false;
    
    const values = Object.keys(project)
      .filter(key => key !== 'id' && key !== 'created_at')
      .map(key => (project as any)[key]);
    
    const [result]: any = await pool.execute(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

export async function setProjectStatus(projectId: string, status: 'allowed' | 'blocked'): Promise<boolean> {
  try {
    const [result]: any = await pool.execute(
      'UPDATE projects SET status = ? WHERE project_id = ?',
      [status, projectId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}

export async function deleteProject(id: number): Promise<boolean> {
  try {
    const [result]: any = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
} 