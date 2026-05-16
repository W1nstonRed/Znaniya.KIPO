export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export function apiError(
  code: string,
  message: string,
  details?: unknown,
): ApiErrorBody {
  return details === undefined ? { code, message } : { code, message, details };
}
