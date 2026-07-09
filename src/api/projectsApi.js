/**
 * Thin client for the CoverFlow Express API.
 * @typedef {import('../types').Project} Project
 */

const API_BASE = 'http://localhost:4000/api';

/**
 * Perform a JSON request against the API and unwrap the response.
 *
 * @param {string} path - Path relative to {@link API_BASE} (e.g. `/projects`).
 * @param {RequestInit} [options] - Standard fetch options.
 * @returns {Promise<unknown>} Parsed JSON body, or `null` for `204 No Content`.
 * @throws {Error} When the response status is not ok.
 */
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
      // Keep default message when the response has no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * Fetch every project, fully hydrated with its child collections.
 * @returns {Promise<Project[]>}
 */
export function fetchProjects() {
  return request('/projects');
}

/**
 * Create a new project from its core details.
 * @param {Partial<Project>} projectData
 * @returns {Promise<Project>}
 */
export function createProjectApi(projectData) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

/**
 * Persist the full state of an existing project (replaces child collections).
 * @param {Project} project
 * @returns {Promise<Project>}
 */
export function saveProjectApi(project) {
  return request(`/projects/${project.id}`, {
    method: 'PUT',
    body: JSON.stringify(project)
  });
}

/**
 * Delete a project and all of its related rows.
 * @param {string} projectId
 * @returns {Promise<null>}
 */
export function deleteProjectApi(projectId) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE'
  });
}

/**
 * Delete a single item from one of a project's child collections.
 * @param {string} projectId
 * @param {string} collection - API collection name (e.g. `stemLinks`).
 * @param {string} itemId
 * @returns {Promise<null>}
 */
export function deleteProjectItemApi(projectId, collection, itemId) {
  return request(`/projects/${projectId}/${collection}/${itemId}`, {
    method: 'DELETE'
  });
}
