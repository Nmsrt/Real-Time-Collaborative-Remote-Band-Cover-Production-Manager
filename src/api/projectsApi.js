const API_BASE = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // Keep default message when response has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function fetchProjects() {
  return request('/projects');
}

export function createProjectApi(projectData) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

export function saveProjectApi(project) {
  return request(`/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(project)
  });
}

export function deleteProjectApi(projectId) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE'
  });
}

export function deleteProjectItemApi(projectId, collection, itemId) {
  return request(`/projects/${projectId}/${collection}/${itemId}`, {
    method: 'DELETE'
  });
}
