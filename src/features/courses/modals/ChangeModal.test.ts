import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("ChangeModal (course)", () => {
  const course = { id: 5, user_id: 1, title: "Judul Lama", description: "Deskripsi Lama" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false or course is missing", () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: false, course } });
    expect(wrapper.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");

    const { wrapper: w2 } = renderWithProviders(ChangeModal, { props: { show: true, course: null } });
    expect(w2.find('[data-testid="edit-course-modal"]').exists()).toBe(false);
  });

  it("should prefill the form with the course values", () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, course } });
    expect((wrapper.find('[data-testid="edit-course-title-input"]').element as HTMLInputElement).value).toBe("Judul Lama");
    expect((wrapper.find('[data-testid="edit-course-description-input"]').element as HTMLTextAreaElement).value).toBe("Deskripsi Lama");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty title and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, { props: { show: true, course } });
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {});

    await wrapper.find('[data-testid="edit-course-title-input"]').setValue("  ");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="edit-course-title-input"]').setValue("Baru");
    await wrapper.find('[data-testid="edit-course-description-input"]').setValue("");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should submit, then refresh data and close after success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, course, onClose: closeSpy },
    });
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {});
    const listSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});
    const detailSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});

    await wrapper.find('[data-testid="edit-course-title-input"]').setValue("  Judul Baru ");
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(changeSpy).toHaveBeenCalledWith(5, "Judul Baru", "Deskripsi Lama");
    expect(wrapper.find('[data-testid="submit-edit-modal-btn"]').text()).toContain("Menyimpan...");

    coursesStore.setIsCourseChanged(true);
    coursesStore.setIsCourseChange(true);
    await tick();

    expect(listSpy).toHaveBeenCalled();
    expect(detailSpy).toHaveBeenCalledWith(5);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should stop loading but stay open when the change fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, course, onClose: closeSpy },
    });
    vi.spyOn(coursesStore, "asyncSetIsCourseChange").mockImplementation(async () => {});

    await wrapper.find("form").trigger("submit");
    await tick();
    coursesStore.setIsCourseChanged(false);
    coursesStore.setIsCourseChange(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-edit-modal-btn"]').text()).toContain("Perbarui");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, course, onClose } });

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-edit-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should close safely when no onClose callback is provided", async () => {
    const { wrapper } = renderWithProviders(ChangeModal, { props: { show: true, course } });
    await wrapper.find('[data-testid="cancel-edit-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="cancel-edit-modal-btn"]').exists()).toBe(true);
  });
});
