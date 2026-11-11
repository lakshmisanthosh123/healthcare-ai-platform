export interface ApiOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  path: string;
}

export class ApiHelper {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options?: ApiOptions) {
    this.baseUrl = options?.baseUrl ?? "";
    this.headers = {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    };
  }

  private buildUrl(path: string) {
    if (path.startsWith("http")) return path;
    return `${this.baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  }

  async request<T = any>({ path, ...init }: RequestOptions): Promise<T> {
    const url = this.buildUrl(path);
    const res = await fetch(url, { headers: this.headers, ...init });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }

    // fallback to text
    return (await res.text()) as unknown as T;
  }

  get<T = any>(path: string, init?: Omit<RequestOptions, "path">) {
    return this.request<T>({ path, method: "GET", ...init });
  }

  post<T = any>(path: string, body?: any, init?: Omit<RequestOptions, "path">) {
    return this.request<T>({
      path,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
  }

  put<T = any>(path: string, body?: any, init?: Omit<RequestOptions, "path">) {
    return this.request<T>({
      path,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...init,
    });
  }

  delete<T = any>(path: string, init?: Omit<RequestOptions, "path">) {
    return this.request<T>({ path, method: "DELETE", ...init });
  }
}
