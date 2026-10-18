import { describe, it, expect, vi, beforeEach } from "vitest";
import AddModal from "./AddModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("AddModal (course)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render the form when show is true", () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty title and description", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, coursesStore } = renderWithProviders(AddModal, { props: { show: true } });
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {});

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await wrapper.find('[data-testid="add-course-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should submit trimmed values, then reset and close after success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {});
    const listSpy = vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(async () => {});

    await wrapper.find('[data-testid="add-course-title-input"]').setValue("  Judul  ");
    await wrapper.find('[data-testid="add-course-description-input"]').setValue("  Deskripsi  ");
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(addSpy).toHaveBeenCalledWith("Judul", "Deskripsi");
    expect(wrapper.find('[data-testid="submit-add-modal-btn"]').text()).toContain("Menyimpan...");

    coursesStore.setIsCourseAdded(true);
    coursesStore.setIsCourseAdd(true);
    await tick();

    expect(listSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect((wrapper.find('[data-testid="add-course-title-input"]').element as HTMLInputElement).value).toBe("");
  });

  it("should stop loading but stay open when the add fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(AddModal, {
      props: { show: true, onClose: closeSpy },
    });
    vi.spyOn(coursesStore, "asyncSetIsCourseAdd").mockImplementation(async () => {});

    await wrapper.find('[data-testid="add-course-title-input"]').setValue("Judul");
    await wrapper.find('[data-testid="add-course-description-input"]').setValue("Deskripsi");
    await wrapper.find("form").trigger("submit");
    await tick();

    coursesStore.setIsCourseAdded(false);
    coursesStore.setIsCourseAdd(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-add-modal-btn"]').text()).toContain("Tambah Kursus");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true, onClose } });

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-add-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should close safely when no onClose callback is provided", async () => {
    const { wrapper } = renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find('[data-testid="cancel-add-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="cancel-add-modal-btn"]').exists()).toBe(true);
  });
});
