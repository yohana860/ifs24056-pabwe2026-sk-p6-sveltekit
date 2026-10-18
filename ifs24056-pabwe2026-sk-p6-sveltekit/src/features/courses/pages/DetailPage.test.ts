import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("DetailPage (course)", () => {
  const owner = { id: 1, name: "Pemilik", email: "o@del.org" } as any;
  const student = { id: 2, name: "Peserta", email: "p@del.org" } as any;
  const stranger = { id: 3, name: "Orang Lain", email: "x@del.org" } as any;
  const course = {
    id: 1,
    user_id: 1,
    title: "Detail Kursus",
    description: "Detail Deskripsi",
    cover: "https://example.com/cover.jpg",
    students: [{ id: 2 }, 5],
    contents: [
      { id: 10, title: "Intro", youtube: "https://youtu.be/dQw4w9WgXcQ" },
      { id: 11, title: "Lanjutan", youtube: "https://youtu.be/dQw4w9WgXcQ" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(() => Promise.resolve());
  });

  function renderAs(profile: any, courseData: any = course) {
    return renderWithProviders(DetailPage, {
      props: { courseId: "1" },
      preloadedState: { profile, course: courseData },
    });
  }

  it("should show a spinner when profile or course is missing", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { courseId: "1" },
      preloadedState: { profile: null, course: null },
    });
    expect(wrapper.text()).not.toContain("Detail Kursus");

    const { wrapper: w2 } = renderWithProviders(DetailPage, {
      props: { courseId: "1" },
      preloadedState: { profile: owner, course: null },
    });
    expect(w2.text()).not.toContain("Detail Kursus");
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledWith("1");
  });

  it("should render the owner interface with controls and content links", () => {
    const { wrapper } = renderAs(owner);

    expect(wrapper.text()).toContain("Detail Kursus");
    expect(wrapper.text()).toContain("Detail Deskripsi");
    expect(wrapper.find('[data-testid="course-student-count"]').text()).toContain("2 peserta");
    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-content-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-content-10"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="content-row-10"] a').attributes("href")).toBe("/courses/1/contents/10");
    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(false);
    expect(wrapper.find("img").exists()).toBe(true);
  });

  it("should prefer the owner interface when the owner is also a student", () => {
    const { wrapper } = renderAs(owner, { ...course, students: [{ id: 1 }] });
    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="leave-course-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(false);
  });

  it("should render the student interface with leave and rating form", () => {
    const { wrapper } = renderAs(student);

    expect(wrapper.find('[data-testid="leave-course-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-cover-btn"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-row-10"] a').exists()).toBe(true);
    expect(wrapper.find('[data-testid="edit-content-10"]').exists()).toBe(false);
  });

  it("should render the join interface and lock contents for non participants", () => {
    const { wrapper } = renderAs(stranger, { ...course, cover: null });

    expect(wrapper.find('[data-testid="join-course-btn"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="rating-form"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-row-10"] a').exists()).toBe(false);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("should handle courses without students and contents", () => {
    const { wrapper } = renderAs(owner, { ...course, students: undefined, contents: undefined });
    expect(wrapper.find('[data-testid="course-student-count"]').text()).toContain("0 peserta");
    expect(wrapper.find('[data-testid="contents-empty"]').exists()).toBe(true);
  });

  it("should update the participant count when the course data changes", async () => {
    const { wrapper, coursesStore: store } = renderAs(owner);
    expect(wrapper.find('[data-testid="course-student-count"]').text()).toContain("2 peserta");

    store.setCourse({ ...course, students: [{ id: 2 }, 5, 7] });
    await tick();

    expect(wrapper.find('[data-testid="course-student-count"]').text()).toContain("3 peserta");
  });

  it("should redirect home when the course could not be loaded, and when it was deleted", async () => {
    const { coursesStore: store } = renderAs(owner);
    mockGoto.mockClear();

    store.setIsCourse(true);
    await tick();
    expect(mockGoto).not.toHaveBeenCalled();
    expect(store.isCourse).toBe(false);

    store.setCourse(null);
    store.setIsCourse(true);
    await tick();
    expect(mockGoto).toHaveBeenCalledWith("/");

    mockGoto.mockClear();
    store.setIsCourseDeleted(true);
    await tick();
    expect(mockGoto).toHaveBeenCalledWith("/");
    expect(store.isCourseDeleted).toBe(false);
  });

  it("should delete the course only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const { wrapper, coursesStore: store } = renderAs(owner);
    const deleteSpy = vi.spyOn(store, "asyncSetIsCourseDelete").mockImplementation(async () => {});

    await wrapper.find('[data-testid="delete-detail-course-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-detail-course-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should open and close the cover and edit modals", async () => {
    const { wrapper } = renderAs(owner);

    await wrapper.find('[data-testid="edit-cover-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="edit-detail-course-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(true);
    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
  });

  it("should open the content modal for adding and editing, and delete after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const { wrapper, coursesStore: store } = renderAs(owner);
    const deleteSpy = vi.spyOn(store, "asyncSetIsCourseContentDelete").mockImplementation(async () => {});

    await wrapper.find('[data-testid="add-content-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="content-modal"]').text()).toContain("Tambah Konten");
    await wrapper.find('[data-testid="close-content-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);

    await wrapper.find('[data-testid="edit-content-10"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="content-modal"]').text()).toContain("Ubah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("Intro");

    await wrapper.find('[data-testid="delete-content-10"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();
    await wrapper.find('[data-testid="delete-content-10"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(10);
  });

  it("should reset the content mutation flag", async () => {
    const { coursesStore: store } = renderAs(owner);
    store.setIsCourseContent(true);
    await tick();
    expect(store.isCourseContent).toBe(false);
  });

  it("should join a course and leave after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const { wrapper, coursesStore: store } = renderAs(stranger);
    const joinSpy = vi.spyOn(store, "asyncSetIsCourseJoin").mockImplementation(async () => {});
    await wrapper.find('[data-testid="join-course-btn"]').trigger("click");
    expect(joinSpy).toHaveBeenCalledWith(1);

    const { wrapper: w2, coursesStore: store2 } = renderAs(student);
    const leaveSpy = vi.spyOn(store2, "asyncSetIsCourseLeave").mockImplementation(async () => {});
    await w2.find('[data-testid="leave-course-btn"]').trigger("click");
    await tick();
    expect(leaveSpy).not.toHaveBeenCalled();
    await w2.find('[data-testid="leave-course-btn"]').trigger("click");
    await tick();
    expect(leaveSpy).toHaveBeenCalledWith(1);
  });

  it("should refresh the course after a successful join or leave", async () => {
    const { coursesStore: store } = renderAs(student);
    (coursesStore.asyncSetCourse as any).mockClear();

    store.setIsCourseStudentDone(false);
    store.setIsCourseStudent(true);
    await tick();
    expect(coursesStore.asyncSetCourse).not.toHaveBeenCalled();

    store.setIsCourseStudentDone(true);
    store.setIsCourseStudent(true);
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledWith("1");
    expect(store.isCourseStudentDone).toBe(false);
  });

  it("should submit a rating with a trimmed comment and refresh after success", async () => {
    const { wrapper, coursesStore: store } = renderAs(student);
    const ratingSpy = vi.spyOn(store, "asyncSetIsCourseRating").mockImplementation(async () => {});

    await wrapper.find('[data-testid="rating-select"]').setValue("4");
    await wrapper.find('[data-testid="rating-comment-input"]').setValue("  Bagus  ");
    await wrapper.find('[data-testid="rating-form"]').trigger("submit");
    expect(ratingSpy).toHaveBeenCalledWith(1, 4, "Bagus");

    (coursesStore.asyncSetCourse as any).mockClear();
    store.setIsCourseRatingDone(false);
    store.setIsCourseRating(true);
    await tick();
    expect(coursesStore.asyncSetCourse).not.toHaveBeenCalled();

    store.setIsCourseRatingDone(true);
    store.setIsCourseRating(true);
    await tick();
    expect(coursesStore.asyncSetCourse).toHaveBeenCalledWith("1");
    expect((wrapper.find('[data-testid="rating-comment-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("should reject a rating outside 1 to 5", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, coursesStore: store } = renderAs(student);
    const ratingSpy = vi.spyOn(store, "asyncSetIsCourseRating").mockImplementation(async () => {});

    const select = wrapper.find('[data-testid="rating-select"]').element as HTMLSelectElement;
    const option = document.createElement("option");
    option.value = "9";
    select.appendChild(option);
    await wrapper.find('[data-testid="rating-select"]').setValue("9");
    await wrapper.find('[data-testid="rating-form"]').trigger("submit");

    expect(errorSpy).toHaveBeenCalledWith("Rating harus bernilai 1 sampai 5");
    expect(ratingSpy).not.toHaveBeenCalled();
  });

  it("should reload when the courseId prop changes", async () => {
    const { rerender } = renderAs(owner);
    (coursesStore.asyncSetCourse as any).mockClear();

    await rerender({ courseId: "2" });
    await tick();

    expect(coursesStore.asyncSetCourse).toHaveBeenCalledWith("2");
  });
});
