import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentModal from "./ContentModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("ContentModal", () => {
  const content = { id: 7, title: "Intro", youtube: "https://youtu.be/dQw4w9WgXcQ" };
  const validUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ContentModal, { props: { show: false, courseId: 1 } });
    expect(wrapper.find('[data-testid="content-modal"]').exists()).toBe(false);
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render an empty form in add mode and a prefilled one in edit mode", () => {
    const { wrapper } = renderWithProviders(ContentModal, { props: { show: true, courseId: 1 } });
    expect(wrapper.text()).toContain("Tambah Konten");
    expect((wrapper.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("");

    const { wrapper: w2 } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content },
    });
    expect(w2.text()).toContain("Ubah Konten");
    expect((w2.find('[data-testid="content-title-input"]').element as HTMLInputElement).value).toBe("Intro");
    expect((w2.find('[data-testid="content-youtube-input"]').element as HTMLInputElement).value).toBe(content.youtube);
  });

  it("should validate empty title and invalid YouTube links", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1 },
    });
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentAdd").mockImplementation(async () => {});

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul konten tidak boleh kosong");

    await wrapper.find('[data-testid="content-title-input"]').setValue("Judul");
    await wrapper.find('[data-testid="content-youtube-input"]').setValue("https://example.com");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Tautan YouTube tidak valid");
    expect(addSpy).not.toHaveBeenCalled();
  });

  it("should add a content then refresh the course and close", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentAdd").mockImplementation(async () => {});
    const detailSpy = vi.spyOn(coursesStore, "asyncSetCourse").mockImplementation(async () => {});

    await wrapper.find('[data-testid="content-title-input"]').setValue(" Materi ");
    await wrapper.find('[data-testid="content-youtube-input"]').setValue(` ${validUrl} `);
    await wrapper.find("form").trigger("submit");
    await tick();

    expect(addSpy).toHaveBeenCalledWith(1, "Materi", validUrl);
    expect(wrapper.find('[data-testid="submit-content-modal-btn"]').text()).toContain("Menyimpan...");

    coursesStore.setIsCourseContentDone(true);
    coursesStore.setIsCourseContent(true);
    await tick();

    expect(detailSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should change an existing content", async () => {
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content },
    });
    const changeSpy = vi.spyOn(coursesStore, "asyncSetIsCourseContentChange").mockImplementation(async () => {});

    await wrapper.find("form").trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(7, "Intro", content.youtube);
  });

  it("should stop loading but stay open when the mutation fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, coursesStore } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, content, onClose: closeSpy },
    });
    vi.spyOn(coursesStore, "asyncSetIsCourseContentChange").mockImplementation(async () => {});

    await wrapper.find("form").trigger("submit");
    await tick();
    coursesStore.setIsCourseContentDone(false);
    coursesStore.setIsCourseContent(true);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="submit-content-modal-btn"]').text()).toContain("Simpan Konten");
  });

  it("should call onClose from the close and cancel buttons", async () => {
    const onClose = vi.fn();
    const { wrapper } = renderWithProviders(ContentModal, {
      props: { show: true, courseId: 1, onClose },
    });

    await wrapper.find('[data-testid="close-content-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-content-modal-btn"]').trigger("click");

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("should close safely when no onClose callback is provided", async () => {
    const { wrapper } = renderWithProviders(ContentModal, { props: { show: true, courseId: 1 } });
    await wrapper.find('[data-testid="cancel-content-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="cancel-content-modal-btn"]').exists()).toBe(true);
  });
});
