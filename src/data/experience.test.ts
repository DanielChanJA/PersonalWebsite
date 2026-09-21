import { describe, expect, it } from "vitest";
import { experiences, resumeSync } from "./experience";

const expectedCompanies = [
  "CoreWeave",
  "Verily",
  "Shipt",
  "TikTok",
  "Slync.io",
  "FreshBooks"
];

describe("experience data", () => {
  it("keeps every résumé employer in reverse chronological order", () => {
    expect(experiences.map(({ company }) => company)).toEqual(expectedCompanies);
  });

  it("gives every employer a unique addressable section", () => {
    const ids = experiences.map(({ id }) => id);

    expect(new Set(ids).size).toBe(experiences.length);
    expect(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
    expect(ids).toEqual(["coreweave", "verily", "shipt", "tiktok", "slync", "freshbooks"]);
  });

  it("marks only the current CoreWeave role as current", () => {
    const currentRoles = experiences.filter(({ current }) => current);

    expect(currentRoles).toHaveLength(1);
    expect(currentRoles[0]?.company).toBe("CoreWeave");
    expect(currentRoles[0]?.dates).toContain("Present");
  });

  it("includes substantive accomplishments and technology tags for every role", () => {
    experiences.forEach((experience) => {
      expect(experience.role.length).toBeGreaterThan(5);
      expect(experience.bullets.length).toBeGreaterThan(0);
      expect(experience.bullets.every((bullet) => bullet.length > 40)).toBe(true);
      expect(experience.tags.length).toBeGreaterThan(2);
    });
  });

  it("preserves the headline impact metrics from the current résumé", () => {
    const coreWeave = experiences[0];
    const coreWeaveCopy = coreWeave?.bullets.join(" ");

    expect(coreWeaveCopy).toContain("15TB");
    expect(coreWeaveCopy).toContain("$2M");
    expect(coreWeaveCopy).toContain("83%");
    expect(coreWeaveCopy).toContain("99.9%");
    expect(coreWeave?.featuredImpact).toEqual([
      { value: "15TB", label: "of security logs centralized daily" },
      { value: "$2M+", label: "annual spend eliminated" },
      { value: "83%", label: "less critical log ingestion latency" }
    ]);
  });

  it("records the source résumé and synchronization date", () => {
    expect(resumeSync).toEqual({
      source: "DANIELCHAN RESUME 2026-1.pdf",
      synchronizedOn: "2026-09-20"
    });
  });
});
