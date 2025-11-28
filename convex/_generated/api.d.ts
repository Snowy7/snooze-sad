/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as analytics from "../analytics.js";
import type * as calendar from "../calendar.js";
import type * as checklists from "../checklists.js";
import type * as comments from "../comments.js";
import type * as dailyChecklist from "../dailyChecklist.js";
import type * as featureRequests from "../featureRequests.js";
import type * as files from "../files.js";
import type * as functions from "../functions.js";
import type * as graphs from "../graphs.js";
import type * as http from "../http.js";
import type * as invitations from "../invitations.js";
import type * as milestones from "../milestones.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as sprints from "../sprints.js";
import type * as tags from "../tags.js";
import type * as taskLists from "../taskLists.js";
import type * as users from "../users.js";
import type * as workItemLinks from "../workItemLinks.js";
import type * as workItems from "../workItems.js";
import type * as workos from "../workos.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  analytics: typeof analytics;
  calendar: typeof calendar;
  checklists: typeof checklists;
  comments: typeof comments;
  dailyChecklist: typeof dailyChecklist;
  featureRequests: typeof featureRequests;
  files: typeof files;
  functions: typeof functions;
  graphs: typeof graphs;
  http: typeof http;
  invitations: typeof invitations;
  milestones: typeof milestones;
  notifications: typeof notifications;
  projects: typeof projects;
  sprints: typeof sprints;
  tags: typeof tags;
  taskLists: typeof taskLists;
  users: typeof users;
  workItemLinks: typeof workItemLinks;
  workItems: typeof workItems;
  workos: typeof workos;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
