const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Send cookies for auth
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Types matching backend schemas
export type ProjectStatus =
  | "draft"
  | "analyzing"
  | "character_review"
  | "producing"
  | "scene_review"
  | "ready"
  | "published"
  | "failed";

export type ProjectListItem = {
  id: string;
  name: string;
  status: ProjectStatus;
  page_count: number;
  thumbnail_url: string | null;
  is_public: boolean;
  updated_at: string;
};

export type ProjectDetail = {
  id: string;
  name: string;
  status: ProjectStatus;
  page_count: number;
  source_format: string | null;
  original_filename: string | null;
  cover_url: string | null;
  thumbnail_url: string | null;
  error_message: string | null;
  is_public: boolean;
  pipeline_progress: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type CreateProjectResponse = {
  project_id: string;
  presigned_url: string;
};

export type ConfirmUploadResponse = {
  project_id: string;
  status: ProjectStatus;
  task_id: string;
};

export type PageUrlsResponse = {
  pages: string[];
};

/**
 * Upload a file directly to S3 via a presigned PUT URL.
 * Uses XMLHttpRequest for upload progress tracking.
 */
function uploadToPresignedUrl(
  url: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/pdf");
    xhr.send(file);
  });
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),

  // Project-specific methods
  createProject: (filename: string) =>
    request<CreateProjectResponse>("/projects/", {
      method: "POST",
      body: { filename },
    }),

  confirmUpload: (projectId: string) =>
    request<ConfirmUploadResponse>(`/projects/${projectId}/confirm-upload`, {
      method: "POST",
    }),

  getProject: (projectId: string) =>
    request<ProjectDetail>(`/projects/${projectId}`),

  getUserProjects: () => request<ProjectListItem[]>("/projects/"),

  getPublicProjects: () => request<ProjectListItem[]>("/public/projects"),

  getProjectPages: (projectId: string) =>
    request<PageUrlsResponse>(`/projects/${projectId}/pages`),

  uploadToPresignedUrl,
};
