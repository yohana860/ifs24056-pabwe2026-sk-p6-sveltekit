import { describe, it, expect, vi, beforeEach } from "vitest";
import courseApi from "./courseApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResult(result: any) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => result,
  } as any);
}

describe("courseApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should accept a response flagged with success=true and no status", async () => {
    mockResult({ success: true, message: "ok" });
    await expect(courseApi.deleteAllCourses()).resolves.toBe("ok");
  });

  describe("courses", () => {
    it("postCourse should post JSON payload and return data", async () => {
      const spy = mockResult({ status: "success", data: { course_id: 3 } });
      await expect(courseApi.postCourse("Judul", "Deskripsi")).resolves.toEqual({ course_id: 3 });
      const [url, options] = spy.mock.calls[0] as any;
      expect(url).toContain("/courses/");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ title: "Judul", description: "Deskripsi" });
    });

    it("postCourse should use server message or fallback on failure", async () => {
      mockResult({ status: "fail", message: "Data tidak valid" });
      await expect(courseApi.postCourse("", "")).rejects.toThrow("Data tidak valid");
      mockResult({ status: "fail" });
      await expect(courseApi.postCourse("", "")).rejects.toThrow("Gagal menambahkan kursus");
    });

    it("postCourseCover should upload with FormData and default file name", async () => {
      const spy = mockResult({ status: "success", message: "Sampul diubah" });
      const file = new File(["x"], "cover.png", { type: "image/png" });
      await expect(courseApi.postCourseCover(3, file)).resolves.toBe("Sampul diubah");
      expect((spy.mock.calls[0] as any)[0]).toContain("/courses/3/cover");
      expect((spy.mock.calls[0] as any)[1].body.get("cover").name).toBe("cover.png");

      await courseApi.postCourseCover(3, new Blob(["x"], { type: "image/png" }) as any);
      expect((spy.mock.calls[1] as any)[1].body.get("cover").name).toBe("cover.jpg");
    });

    it("postCourseCover should throw fallback error", async () => {
      mockResult({ status: "fail" });
      await expect(courseApi.postCourseCover(3, new File(["x"], "c.png"))).rejects.toThrow(
        "Gagal mengubah sampul"
      );
    });

    it("putCourse should send PUT and return message", async () => {
      const spy = mockResult({ status: "success", message: "Diubah" });
      await expect(courseApi.putCourse(5, "T", "D")).resolves.toBe("Diubah");
      const [url, options] = spy.mock.calls[0] as any;
      expect(url).toContain("/courses/5");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ title: "T", description: "D" });
      mockResult({ status: "fail" });
      await expect(courseApi.putCourse(5, "T", "D")).rejects.toThrow("Gagal mengubah kursus");
    });

    it("getCourses should return the courses array or an empty array", async () => {
      mockResult({ status: "success", data: { courses: [{ id: 1 }] } });
      await expect(courseApi.getCourses()).resolves.toEqual([{ id: 1 }]);
      mockResult({ status: "success", data: {} });
      await expect(courseApi.getCourses()).resolves.toEqual([]);
      mockResult({ status: "fail" });
      await expect(courseApi.getCourses()).rejects.toThrow("Gagal mengambil data kursus");
    });

    it("getCourseById should return the course", async () => {
      const spy = mockResult({ status: "success", data: { course: { id: 2 } } });
      await expect(courseApi.getCourseById(2)).resolves.toEqual({ id: 2 });
      expect((spy.mock.calls[0] as any)[0]).toContain("/courses/2");
      mockResult({ status: "fail" });
      await expect(courseApi.getCourseById(2)).rejects.toThrow("Gagal mengambil detail kursus");
    });

    it("deleteCourse and deleteAllCourses should send DELETE", async () => {
      const spy = mockResult({ status: "success", message: "Dihapus" });
      await expect(courseApi.deleteCourse(4)).resolves.toBe("Dihapus");
      expect((spy.mock.calls[0] as any)[0]).toContain("/courses/4");
      expect((spy.mock.calls[0] as any)[1].method).toBe("DELETE");
      await courseApi.deleteAllCourses();
      expect((spy.mock.calls[1] as any)[0]).toMatch(/\/courses\/$/);

      mockResult({ status: "fail" });
      await expect(courseApi.deleteCourse(4)).rejects.toThrow("Gagal menghapus kursus");
      await expect(courseApi.deleteAllCourses()).rejects.toThrow("Gagal menghapus semua kursus");
    });
  });

  describe("students and ratings", () => {
    it("postStudent and deleteStudent should call the students endpoint", async () => {
      const spy = mockResult({ status: "success", message: "ok" });
      await courseApi.postStudent(1);
      await courseApi.deleteStudent(1);
      expect((spy.mock.calls[0] as any)[0]).toContain("/courses/1/students");
      expect((spy.mock.calls[0] as any)[1].method).toBe("POST");
      expect((spy.mock.calls[1] as any)[1].method).toBe("DELETE");

      mockResult({ status: "fail" });
      await expect(courseApi.postStudent(1)).rejects.toThrow("Gagal mendaftar ke kursus");
      await expect(courseApi.deleteStudent(1)).rejects.toThrow("Gagal keluar dari kursus");
    });

    it("postRating should send rating and comment", async () => {
      const spy = mockResult({ status: "success", message: "Rating dikirim" });
      await expect(courseApi.postRating(1, 4, "Bagus")).resolves.toBe("Rating dikirim");
      const [url, options] = spy.mock.calls[0] as any;
      expect(url).toContain("/courses/1/ratings");
      expect(JSON.parse(options.body)).toEqual({ rating: 4, comment: "Bagus" });
      mockResult({ status: "fail" });
      await expect(courseApi.postRating(1, 4, "")).rejects.toThrow("Gagal memberi rating");
    });
  });

  describe("contents", () => {
    it("postContent should send title and youtube", async () => {
      const spy = mockResult({ status: "success", message: "Konten ditambah" });
      await expect(courseApi.postContent(1, "Materi", "https://youtu.be/x")).resolves.toBe(
        "Konten ditambah"
      );
      const [url, options] = spy.mock.calls[0] as any;
      expect(url).toContain("/courses/1/contents");
      expect(JSON.parse(options.body)).toEqual({ title: "Materi", youtube: "https://youtu.be/x" });
      mockResult({ status: "fail" });
      await expect(courseApi.postContent(1, "a", "b")).rejects.toThrow("Gagal menambahkan konten");
    });

    it("putContent, getContentById and deleteContent should use the -/contents endpoint", async () => {
      const spy = mockResult({
        status: "success",
        message: "ok",
        data: { course_content: { id: 7, title: "M" } },
      });
      await courseApi.putContent(7, "M", "https://youtu.be/x");
      await expect(courseApi.getContentById(7)).resolves.toEqual({ id: 7, title: "M" });
      await courseApi.deleteContent(7);
      expect((spy.mock.calls[0] as any)[0]).toContain("/courses/-/contents/7");
      expect((spy.mock.calls[0] as any)[1].method).toBe("PUT");
      expect((spy.mock.calls[1] as any)[1].method).toBe("GET");
      expect((spy.mock.calls[2] as any)[1].method).toBe("DELETE");

      mockResult({ status: "fail" });
      await expect(courseApi.putContent(7, "a", "b")).rejects.toThrow("Gagal mengubah konten");
      await expect(courseApi.getContentById(7)).rejects.toThrow("Gagal mengambil detail konten");
      await expect(courseApi.deleteContent(7)).rejects.toThrow("Gagal menghapus konten");
    });

    it("putContentLearn should send the status", async () => {
      const spy = mockResult({ status: "success", message: "Status diubah" });
      await expect(courseApi.putContentLearn(7, 1)).resolves.toBe("Status diubah");
      const [url, options] = spy.mock.calls[0] as any;
      expect(url).toContain("/courses/-/contents/7/learns");
      expect(JSON.parse(options.body)).toEqual({ status: 1 });
      mockResult({ status: "fail" });
      await expect(courseApi.putContentLearn(7, 0)).rejects.toThrow("Gagal mengubah status belajar");
    });
  });
});
