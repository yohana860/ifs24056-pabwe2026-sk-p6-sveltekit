import { describe, it, expect } from "vitest";
import { getYoutubeEmbedUrl, isCourseStudent } from "./youtube";

describe("getYoutubeEmbedUrl", () => {
  it("should convert watch, short, embed and shorts links", () => {
    const id = "dQw4w9WgXcQ";
    expect(getYoutubeEmbedUrl(`https://www.youtube.com/watch?v=${id}`)).toBe(
      `https://www.youtube.com/embed/${id}`
    );
    expect(getYoutubeEmbedUrl(`https://www.youtube.com/watch?list=x&v=${id}`)).toBe(
      `https://www.youtube.com/embed/${id}`
    );
    expect(getYoutubeEmbedUrl(`https://youtu.be/${id}`)).toBe(`https://www.youtube.com/embed/${id}`);
    expect(getYoutubeEmbedUrl(`https://www.youtube.com/embed/${id}`)).toBe(
      `https://www.youtube.com/embed/${id}`
    );
    expect(getYoutubeEmbedUrl(`https://www.youtube.com/shorts/${id}`)).toBe(
      `https://www.youtube.com/embed/${id}`
    );
  });

  it("should return null for non YouTube links", () => {
    expect(getYoutubeEmbedUrl("https://example.com/video")).toBeNull();
    expect(getYoutubeEmbedUrl("")).toBeNull();
  });
});

describe("isCourseStudent", () => {
  it("should be false when students is missing or empty", () => {
    expect(isCourseStudent(undefined, 1)).toBe(false);
    expect(isCourseStudent([], 1)).toBe(false);
  });

  it("should match object students by id", () => {
    expect(isCourseStudent([{ id: 1 }, { id: 2 }], 2)).toBe(true);
    expect(isCourseStudent([{ id: 1 }], 3)).toBe(false);
  });

  it("should match primitive ids", () => {
    expect(isCourseStudent([5, "7"], "7")).toBe(true);
    expect(isCourseStudent([5], 6)).toBe(false);
  });
});
