import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/editor", "routes/editor.tsx"),
  route("/api/upload-image", "routes/api/upload-image.ts"),
  route("/api/list-images", "routes/api/list-images.ts"),
  route("/api/save-article", "routes/api/save-article.ts"),
  route("/api/publish-issue", "routes/api/publish-issue.ts"),
] satisfies RouteConfig;
