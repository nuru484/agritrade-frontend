import { brandOgImage, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og-template";

export const alt =
  "Nasara Agro — bulk maize, soya beans & groundnuts, weighed honestly, trucked south";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function OpengraphImage() {
  return brandOgImage({
    eyebrow: "Dispatch · Tamale, Northern Region",
    title: "Nasara Agro",
    subtitle: "Weighed honestly, trucked south.",
  });
}
