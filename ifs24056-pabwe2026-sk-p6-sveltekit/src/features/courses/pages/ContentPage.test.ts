import { describe, it, expect, vi, beforeEach } from "vitest";
import ContentPage from "./ContentPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("ContentPage", () => {
  const profile = { id: 1, name: "Peserta" } as any;
  const content = { id: 9, title: "Materi 1", youtube: "https://youtu.be/dQw4w9WgXcQ", learned: 0 };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetContent").mockImplementation(() => Promise.resolve());
  });

  function renderPage(state: Record<string, any>) {
    return renderWithProviders(ContentPage, {
      props: { courseId: "1", contentId: "9" },
      preloadedState: state,
    });
  }

  it("should show a spinner and load the content on mount", () => {
    const { wrapper } = renderPage({ profile: null, content: null });
    expect(wrapper.text()).not.toContain("Materi 1");
    expect(coursesStore.asyncSetContent).toHaveBeenCalledWith("9");

    const { wrapper: w2 } = renderPage({ profile, content: null });
    expect(w2.find('[data-testid="toggle-learned-btn"]').exists()).toBe(false);
  });

  it("should render the YouTube player for valid links", () => {
    const { wrapper } = renderPage({ profile, content });
    expect(wrapper.text()).toContain("Materi 1");
    expect(wrapper.find('[data-testid="content-player"]').attributes("src")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
    expect(wrapper.find('[data-testid="back-to-course-link"]').attributes("href")).toBe("/courses/1");
    expect(wrapper.find('[data-testid="toggle-learned-btn"]').text()).toContain("Tandai Selesai");
  });

  it("should render a fallback link for non YouTube links", () => {
    const { wrapper } = renderPage({ profile, content: { ...content, youtube: "https://example.com/v" } });
    expect(wrapper.find('[data-testid="content-player"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="content-fallback"]').exists()).toBe(true);
  });

  it("should mark a content as done and as not done", async () => {
    const { wrapper, coursesStore: store } = renderPage({ profile, content });
    const learnSpy = vi.spyOn(store, "asyncSetIsContentLearn").mockImplementation(async () => {});

    await wrapper.find('[data-testid="toggle-learned-btn"]').trigger("click");
    expect(learnSpy).toHaveBeenCalledWith("9", 1);

    const { wrapper: w2, coursesStore: store2 } = renderPage({
      profile,
      content: { ...content, learned: 1 },
    });
    const learnSpy2 = vi.spyOn(store2, "asyncSetIsContentLearn").mockImplementation(async () => {});
    expect(w2.find('[data-testid="toggle-learned-btn"]').text()).toContain("Sudah Selesai");
    await w2.find('[data-testid="toggle-learned-btn"]').trigger("click");
    expect(learnSpy2).toHaveBeenCalledWith("9", 0);
  });

  it("should refresh the content after a successful learn status update", async () => {
    const { coursesStore: store } = renderPage({ profile, content });
    (coursesStore.asyncSetContent as any).mockClear();

    store.setIsContentLearned(false);
    store.setIsContentLearn(true);
    await tick();
    expect(coursesStore.asyncSetContent).not.toHaveBeenCalled();

    store.setIsContentLearned(true);
    store.setIsContentLearn(true);
    await tick();
    expect(coursesStore.asyncSetContent).toHaveBeenCalledWith("9");
    expect(store.isContentLearned).toBe(false);
  });

  it("should go back to the course when the content could not be loaded", async () => {
    const { coursesStore: store } = renderPage({ profile, content });
    mockGoto.mockClear();

    store.setIsContent(true);
    await tick();
    expect(mockGoto).not.toHaveBeenCalled();
    expect(store.isContent).toBe(false);

    store.setContent(null);
    store.setIsContent(true);
    await tick();
    expect(mockGoto).toHaveBeenCalledWith("/courses/1");
  });
});
