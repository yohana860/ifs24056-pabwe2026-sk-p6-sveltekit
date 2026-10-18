import { describe, it, expect, vi, beforeEach } from "vitest";
import { coursesStore, useCoursesStore } from "./coursesStore";
import courseApi from "../api/courseApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const FLAGS = [
  "Course",
  "CourseAdd",
  "CourseAdded",
  "CourseChange",
  "CourseChanged",
  "CourseChangeCover",
  "CourseChangedCover",
  "CourseDelete",
  "CourseDeleted",
  "CourseDeleteAll",
  "CourseDeletedAll",
  "CourseStudent",
  "CourseStudentDone",
  "CourseRating",
  "CourseRatingDone",
  "CourseContent",
  "CourseContentDone",
  "Content",
  "ContentLearn",
  "ContentLearned",
];

describe("coursesStore", () => {
  let successSpy: any;
  let errorSpy: any;
  const store: any = coursesStore;

  beforeEach(() => {
    coursesStore.reset();
    vi.restoreAllMocks();
    successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});
    errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
  });

  it("should expose the default state through getters and $state", () => {
    const s: any = useCoursesStore();
    expect(s.courses).toEqual([]);
    expect(s.course).toBeNull();
    expect(s.content).toBeNull();
    FLAGS.forEach((flag) => {
      expect(s[`is${flag}`]).toBe(false);
      expect(s.$state[`is${flag}`]).toBe(false);
    });
  });

  it("should update state with every setter and reset with a custom state", () => {
    store.setCourses([{ id: 1 }]);
    store.setCourse({ id: 2 });
    store.setContent({ id: 3 });
    expect(store.courses).toEqual([{ id: 1 }]);
    expect(store.course).toEqual({ id: 2 });
    expect(store.content).toEqual({ id: 3 });

    FLAGS.forEach((flag) => {
      store[`setIs${flag}`](true);
      expect(store[`is${flag}`]).toBe(true);
    });

    store.reset({ courses: [{ id: 9 }] });
    expect(store.courses).toEqual([{ id: 9 }]);
    expect(store.isCourse).toBe(false);
  });

  it("asyncSetCourses should set courses or an empty array", async () => {
    vi.spyOn(courseApi, "getCourses").mockResolvedValueOnce([{ id: 1 } as any]);
    await coursesStore.asyncSetCourses();
    expect(coursesStore.courses).toEqual([{ id: 1 }]);

    vi.spyOn(courseApi, "getCourses").mockRejectedValueOnce(new Error("x"));
    await coursesStore.asyncSetCourses();
    expect(coursesStore.courses).toEqual([]);
  });

  it("asyncSetCourse should set the course (or null) and flag isCourse", async () => {
    vi.spyOn(courseApi, "getCourseById").mockResolvedValueOnce({ id: 1 } as any);
    await coursesStore.asyncSetCourse(1);
    expect(coursesStore.course).toEqual({ id: 1 });
    expect(coursesStore.isCourse).toBe(true);

    coursesStore.setIsCourse(false);
    vi.spyOn(courseApi, "getCourseById").mockRejectedValueOnce(new Error("x"));
    await coursesStore.asyncSetCourse(1);
    expect(coursesStore.course).toBeNull();
    expect(coursesStore.isCourse).toBe(true);
  });

  it("asyncSetContent should set the content (or null) and flag isContent", async () => {
    vi.spyOn(courseApi, "getContentById").mockResolvedValueOnce({ id: 5 } as any);
    await coursesStore.asyncSetContent(5);
    expect(coursesStore.content).toEqual({ id: 5 });
    expect(coursesStore.isContent).toBe(true);

    coursesStore.setIsContent(false);
    vi.spyOn(courseApi, "getContentById").mockRejectedValueOnce(new Error("x"));
    await coursesStore.asyncSetContent(5);
    expect(coursesStore.content).toBeNull();
    expect(coursesStore.isContent).toBe(true);
  });

  it("asyncSetIsCourseAdd should flag success and failure", async () => {
    vi.spyOn(courseApi, "postCourse").mockResolvedValueOnce({});
    await coursesStore.asyncSetIsCourseAdd("T", "D");
    expect(successSpy).toHaveBeenCalledWith("Kursus berhasil ditambahkan!");
    expect(coursesStore.isCourseAdded).toBe(true);
    expect(coursesStore.isCourseAdd).toBe(true);

    vi.spyOn(courseApi, "postCourse").mockRejectedValueOnce(new Error("Gagal"));
    await coursesStore.asyncSetIsCourseAdd("T", "D");
    expect(errorSpy).toHaveBeenCalledWith("Gagal");
    expect(coursesStore.isCourseAdded).toBe(false);
  });

  const mutations: Array<{
    name: string;
    api: string;
    call: () => Promise<any>;
    done: string;
    flag: string;
    fallback: string;
  }> = [
    {
      name: "asyncSetIsCourseChange",
      api: "putCourse",
      call: () => coursesStore.asyncSetIsCourseChange(1, "T", "D"),
      done: "isCourseChanged",
      flag: "isCourseChange",
      fallback: "Kursus berhasil diperbarui!",
    },
    {
      name: "asyncSetIsCourseChangeCover",
      api: "postCourseCover",
      call: () => coursesStore.asyncSetIsCourseChangeCover(1, new File(["x"], "c.png")),
      done: "isCourseChangedCover",
      flag: "isCourseChangeCover",
      fallback: "Sampul berhasil diperbarui!",
    },
    {
      name: "asyncSetIsCourseDelete",
      api: "deleteCourse",
      call: () => coursesStore.asyncSetIsCourseDelete(1),
      done: "isCourseDeleted",
      flag: "isCourseDelete",
      fallback: "Kursus berhasil dihapus!",
    },
    {
      name: "asyncSetIsCourseDeleteAll",
      api: "deleteAllCourses",
      call: () => coursesStore.asyncSetIsCourseDeleteAll(),
      done: "isCourseDeletedAll",
      flag: "isCourseDeleteAll",
      fallback: "Semua kursus berhasil dihapus!",
    },
    {
      name: "asyncSetIsCourseJoin",
      api: "postStudent",
      call: () => coursesStore.asyncSetIsCourseJoin(1),
      done: "isCourseStudentDone",
      flag: "isCourseStudent",
      fallback: "Berhasil mendaftar ke kursus!",
    },
    {
      name: "asyncSetIsCourseLeave",
      api: "deleteStudent",
      call: () => coursesStore.asyncSetIsCourseLeave(1),
      done: "isCourseStudentDone",
      flag: "isCourseStudent",
      fallback: "Berhasil keluar dari kursus!",
    },
    {
      name: "asyncSetIsCourseRating",
      api: "postRating",
      call: () => coursesStore.asyncSetIsCourseRating(1, 5, "Mantap"),
      done: "isCourseRatingDone",
      flag: "isCourseRating",
      fallback: "Rating berhasil dikirim!",
    },
    {
      name: "asyncSetIsCourseContentAdd",
      api: "postContent",
      call: () => coursesStore.asyncSetIsCourseContentAdd(1, "T", "https://youtu.be/x"),
      done: "isCourseContentDone",
      flag: "isCourseContent",
      fallback: "Konten berhasil ditambahkan!",
    },
    {
      name: "asyncSetIsCourseContentChange",
      api: "putContent",
      call: () => coursesStore.asyncSetIsCourseContentChange(2, "T", "https://youtu.be/x"),
      done: "isCourseContentDone",
      flag: "isCourseContent",
      fallback: "Konten berhasil diperbarui!",
    },
    {
      name: "asyncSetIsCourseContentDelete",
      api: "deleteContent",
      call: () => coursesStore.asyncSetIsCourseContentDelete(2),
      done: "isCourseContentDone",
      flag: "isCourseContent",
      fallback: "Konten berhasil dihapus!",
    },
    {
      name: "asyncSetIsContentLearn",
      api: "putContentLearn",
      call: () => coursesStore.asyncSetIsContentLearn(2, 1),
      done: "isContentLearned",
      flag: "isContentLearn",
      fallback: "Status belajar diperbarui!",
    },
  ];

  mutations.forEach((m) => {
    describe(m.name, () => {
      it("should show the server message when present", async () => {
        vi.spyOn(courseApi as any, m.api).mockResolvedValueOnce("Pesan server");
        await m.call();
        expect(successSpy).toHaveBeenCalledWith("Pesan server");
        expect(store[m.done]).toBe(true);
        expect(store[m.flag]).toBe(true);
      });

      it("should use the fallback message when the server sends none", async () => {
        vi.spyOn(courseApi as any, m.api).mockResolvedValueOnce("");
        await m.call();
        expect(successSpy).toHaveBeenCalledWith(m.fallback);
      });

      it("should flag failure and show the error", async () => {
        vi.spyOn(courseApi as any, m.api).mockRejectedValueOnce(new Error("Gagal"));
        await m.call();
        expect(errorSpy).toHaveBeenCalledWith("Gagal");
        expect(store[m.done]).toBe(false);
        expect(store[m.flag]).toBe(true);
      });
    });
  });
});
