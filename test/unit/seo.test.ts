import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo";

describe("pageMetadata", () => {
  it("suffixes the brand and sets the canonical path", () => {
    const meta = pageMetadata({
      title: "Contact the dispatch office",
      description: "Call the Tamale dispatch line.",
      path: "/contact",
    });
    expect(meta.title).toEqual({
      absolute: "Contact the dispatch office · DB Plus",
    });
    expect(meta.alternates?.canonical).toBe("/contact");
    expect(meta.robots).toBeUndefined();
  });

  it("clamps overlong titles and descriptions on word boundaries", () => {
    const meta = pageMetadata({
      title:
        "A very long page title that would absolutely overflow any search result snippet ever rendered",
      description: "word ".repeat(60),
      path: "/x",
    });
    const title = (meta.title as { absolute: string }).absolute;
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith("· DB Plus")).toBe(true);
    expect((meta.description as string).length).toBeLessThanOrEqual(125);
    expect(meta.description).toMatch(/…$/);
  });

  it("noindexes placeholder pages but keeps follow", () => {
    const meta = pageMetadata({
      title: "Land",
      description: "d",
      path: "/land",
      index: false,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
  });
});
