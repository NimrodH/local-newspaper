import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/editor", "routes/editor.tsx"),
  route("/api/upload-image", "routes/api/upload-image.ts"),
  route("/api/list-images", "routes/api/list-images.ts"),
  route("/api/track-click", "routes/api/track-click.ts"),
  route("/api/save-article", "routes/api/save-article.ts"),
  route("/api/create-issue", "routes/api/create-issue.ts"),
  route("/api/publish-issue", "routes/api/publish-issue.ts"),
  route("/api/unpublish-issue", "routes/api/unpublish-issue.ts"),
  route("/api/delete-issue", "routes/api/delete-issue.ts"),
] satisfies RouteConfig;
