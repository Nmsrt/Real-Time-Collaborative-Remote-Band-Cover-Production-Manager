/**
 * Shared JSDoc type definitions for the project data model.
 *
 * This file emits no runtime code; it exists so editors and `// @ts-check`
 * can reason about the shapes exchanged between the API layer and the UI.
 */

/**
 * @typedef {Object} Member
 * @property {string} id
 * @property {string} name
 * @property {string} color - CSS color used for the member badge.
 */

/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {string} [note]
 * @property {string} [url]
 */

/**
 * @typedef {Object} Role
 * @property {string} id
 * @property {string} role
 * @property {string|null} [memberId]
 * @property {string} [deadline]
 * @property {string} [status]
 * @property {string} [note]
 */

/**
 * @typedef {Object} ResourceLink
 * @property {string} id
 * @property {string|null} [roleId]
 * @property {string|null} [memberId]
 * @property {string} label
 * @property {string} url
 * @property {string} [status]
 */

/**
 * @typedef {Object} Mix
 * @property {string} id
 * @property {string} label
 * @property {string} url
 * @property {string} [status]
 * @property {string} [note]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Section
 * @property {string} id
 * @property {string} label
 * @property {string} [difficulty]
 * @property {string} [note]
 * @property {string} [members]
 */

/**
 * @typedef {Object} Feedback
 * @property {string} id
 * @property {string} [author]
 * @property {string|null} [memberId]
 * @property {string} [role]
 * @property {string} message
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} [artist]
 * @property {string} [bpm]
 * @property {string} [key]
 * @property {string} [difficulty]
 * @property {string} [driveUrl]
 * @property {Member[]} members
 * @property {Reference[]} references
 * @property {Role[]} roles
 * @property {ResourceLink[]} stemLinks
 * @property {ResourceLink[]} videoLinks
 * @property {Mix[]} latestMixes
 * @property {Section[]} sections
 * @property {Feedback[]} feedback
 */

export {};
