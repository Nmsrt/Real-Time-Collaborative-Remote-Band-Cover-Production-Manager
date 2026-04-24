import { STORAGE_KEY, starterProjects } from '../data/starterProjects';

export function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : starterProjects;
  } catch {
    return starterProjects;
  }
}
