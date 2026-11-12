import axios from 'axios';

/** Backend origin + global `/api` prefix. Override with VITE_API_URL. */
export const API_URL: string = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/+$/, '');

export interface FieldErrors {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

/** Any non-2xx answer from the backend, or a network failure (status 0). */
export class ApiError extends Error {
  readonly status: number;
  /** Present on 400 validation failures. */
  readonly errors?: FieldErrors;

  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }
}

/** Builds an ApiError from a NestJS error body (`{ message, errors? }`). */
export function toApiError(status: number, body: unknown): ApiError {
  const b = (body && typeof body === 'object' ? body : {}) as {
    message?: string | string[];
    errors?: FieldErrors;
  };
  const message = Array.isArray(b.message) ? b.message.join('; ') : b.message;
  return new ApiError(status, message || `Request failed (${status})`, b.errors);
}

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Called on any 401 (session missing or expired), e.g. to redirect to /login. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

export function notifyUnauthorized() {
  onUnauthorized?.();
}

/** The session lives in an httpOnly cookie, so every request sends credentials. */
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err: unknown) => {
    if (axios.isCancel(err)) return Promise.reject(err);
    if (axios.isAxiosError(err) && err.response) {
      const apiError = toApiError(err.response.status, err.response.data);
      if (apiError.isUnauthorized) notifyUnauthorized();
      return Promise.reject(apiError);
    }
    return Promise.reject(
      new ApiError(0, 'Network error. Check your connection and try again.'),
    );
  },
);
