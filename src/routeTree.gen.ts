/**
 * Deterministic route tree for the Valtaris control plane.
 * This file provides a typed, introspectable route map used
 * by the server for indexing, dispatching, and validation.
 */

export interface RouteNode {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  children?: RouteNode[];
}

export const routeTree: RouteNode[] = [
  {
    path: "/organizations",
    method: "GET",
    children: [
      { path: "/organizations/create", method: "POST" },
      { path: "/organizations/update", method: "PUT" },
      { path: "/organizations/delete", method: "DELETE" }
    ]
  },
  {
    path: "/projects",
    method: "GET",
    children: [
      { path: "/projects/create", method: "POST" },
      { path: "/projects/update", method: "PUT" },
      { path: "/projects/delete", method: "DELETE" }
    ]
  },
  {
    path: "/environments",
    method: "GET",
    children: [
      { path: "/environments/create", method: "POST" },
      { path: "/environments/update", method: "PUT" },
      { path: "/environments/delete", method: "DELETE" }
    ]
  },
  {
    path: "/connectors",
    method: "GET",
    children: [
      { path: "/connectors/create", method: "POST" },
      { path: "/connectors/update", method: "PUT" },
      { path: "/connectors/delete", method: "DELETE" }
    ]
  },
  {
    path: "/credentials",
    method: "GET",
    children: [
      { path: "/credentials/create", method: "POST" },
      { path: "/credentials/update", method: "PUT" },
      { path: "/credentials/delete", method: "DELETE" }
    ]
  },
  {
    path: "/templates",
    method: "GET",
    children: [
      { path: "/templates/create", method: "POST" },
      { path: "/templates/update", method: "PUT" },
      { path: "/templates/delete", method: "DELETE" }
    ]
  }
];

export function listRoutes(): RouteNode[] {
  return routeTree;
}

export function findRoute(path: string, method: string): RouteNode | null {
  for (const node of routeTree) {
    if (node.path === path && node.method === method) {
      return node;
    }

    if (node.children) {
      const match = node.children.find(
        child => child.path === path && child.method === method
      );
      if (match) {
        return match;
      }
    }
  }

  return null;
}
