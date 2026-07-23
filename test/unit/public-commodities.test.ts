// Honest emptiness on the public availability feed: an empty publish list
// (or a down API) yields empty board lines and lot files - the pages render
// their designed empty states instead of stand-in stock.
import { describe, expect, it } from "vitest";
import {
  toBoardLines,
  toLots,
  type PublicCommodity,
} from "@/lib/public-commodities";

const maize: PublicCommodity = {
  id: "c1",
  name: "Maize",
  description: null,
  photo: "https://res.cloudinary.com/demo/maize.jpg",
  variety: "White",
  qualityGrade: "Grade 1",
  available: true,
};

describe("toBoardLines", () => {
  it("returns [] for an empty publish list and for a down API", () => {
    expect(toBoardLines([])).toEqual([]);
    expect(toBoardLines(null)).toEqual([]);
  });

  it("maps live commodities, keeping static market copy for known names", () => {
    const lines = toBoardLines([maize]);
    expect(lines).toHaveLength(1);
    expect(lines[0].name).toBe("Maize");
    expect(lines[0].available).toBe(true);
    expect(lines[0].meta).toBe("Main harvest from September");
  });
});

describe("toLots", () => {
  it("returns [] for an empty publish list and for a down API", () => {
    expect(toLots([])).toEqual([]);
    expect(toLots(null)).toEqual([]);
  });

  it("keeps the rich static lot copy for known names and live stock flags", () => {
    const lots = toLots([{ ...maize, available: false }]);
    expect(lots).toHaveLength(1);
    expect(lots[0].name).toBe("Maize");
    expect(lots[0].inStock).toBe(false);
    expect(lots[0].photo).toBe(maize.photo);
  });

  it("renders unknown commodities from their own fields", () => {
    const lots = toLots([{ ...maize, id: "c2", name: "Sorghum" }]);
    expect(lots[0].lotNo).toBe("LOT-01");
    expect(lots[0].grades).toContain("White");
    expect(lots[0].inStock).toBe(true);
  });
});
