// The backend-facing cache-purge endpoint: secret-gated (fails closed),
// validates the tag payload, purges known tags and reports unknown ones as
// skipped. next/cache is mocked - no real cache is touched.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}));

const { POST } = await import("@/app/api/revalidate/route");

const call = (body: unknown, secret?: string) =>
  POST(
    new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-revalidate-secret": secret } : {}),
      },
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  revalidateTag.mockReset();
  vi.stubEnv("REVALIDATE_SECRET", "test-secret");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/revalidate", () => {
  it("purges known tags and reports unknown ones as skipped", async () => {
    const res = await call(
      { tags: ["commodities", "land-plots", "mystery"] },
      "test-secret",
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      revalidated: ["commodities", "land-plots"],
      skipped: ["mystery"],
    });
    expect(revalidateTag).toHaveBeenCalledWith("commodities", "max");
    expect(revalidateTag).toHaveBeenCalledWith("land-plots", "max");
    expect(revalidateTag).toHaveBeenCalledTimes(2);
  });

  it("rejects a wrong or missing secret", async () => {
    expect((await call({ tags: ["commodities"] }, "wrong")).status).toBe(401);
    expect((await call({ tags: ["commodities"] })).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("fails closed when the secret is not configured", async () => {
    vi.stubEnv("REVALIDATE_SECRET", "");
    const res = await call({ tags: ["commodities"] }, "");
    expect(res.status).toBe(401);
  });

  it("rejects malformed tag payloads", async () => {
    expect((await call({ tags: [] }, "test-secret")).status).toBe(400);
    expect((await call({ tags: "commodities" }, "test-secret")).status).toBe(
      400,
    );
    expect((await call({ tags: [42] }, "test-secret")).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
