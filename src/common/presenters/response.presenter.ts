export function formatSucessResponse<T>(
  message: string,
  data?: T,
): { message: string; data: T } {
  return { message, data };
}
