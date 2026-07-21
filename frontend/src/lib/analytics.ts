export function track(
  eventName: string,
  payload?: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  );
}
