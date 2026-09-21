import { describe, expect, it } from "vitest";
import profile from "./profile.json";

describe("public profile data", () => {
  it("uses secure canonical and social URLs", () => {
    expect(new URL(profile.url).protocol).toBe("https:");
    expect(Object.values(profile.social).every((url) => new URL(url).protocol === "https:")).toBe(true);
  });

  it("keeps contact links valid", () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(profile.phone.href).toMatch(/^\+[1-9]\d{7,14}$/);
  });

  it("contains the metadata needed by every page", () => {
    expect(profile.name).toBeTruthy();
    expect(profile.title).toBeTruthy();
    expect(profile.description.length).toBeGreaterThan(80);
    expect(profile.contentModifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Number.isNaN(Date.parse(profile.contentModifiedOn))).toBe(false);
    expect(profile.location.country).toMatch(/^[A-Z]{2}$/);
  });
});
