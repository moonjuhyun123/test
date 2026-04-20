// Mock 모드 전환. VITE_USE_MOCK=true 일 때 fetch를 가로채 정적 응답 반환.
// 실제 Mock 응답은 /implement-front 단계에서 각 도메인이 등록.

export function useMock(): boolean {
  return String(import.meta.env.VITE_USE_MOCK).toLowerCase() === 'true';
}

type Handler = (input: Request) => Promise<Response> | Response | null;

const handlers: Handler[] = [];

export function registerMock(handler: Handler): void {
  handlers.push(handler);
}

export function installMockFetch(): void {
  if (!useMock()) return;
  const original = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(input.toString(), init);
    for (const handler of handlers) {
      const res = await handler(req);
      if (res) return res;
    }
    return original(input, init);
  };
}
