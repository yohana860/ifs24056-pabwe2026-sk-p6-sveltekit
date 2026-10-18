import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { coursesStore } from "../states/coursesStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("HomePage (courses)", () => {
  const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" } as any;
  const mine = {
    id: 1,
    user_id: 1,
    title: "Dasar Web",
    description: "Belajar HTML dan CSS",
    cover: "https://example.com/cover.jpg",
  };
  const other = { id: 2, user_id: 2, title: "Algoritma", description: "Punya orang lain", cover: null };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(coursesStore, "asyncSetCourses").mockImplementation(() => Promise.resolve());
  });

  it("should render nothing while the profile is not loaded", () => {
    const { wrapper } = renderWithProviders(HomePage, { preloadedState: { profile: null } });
    expect(wrapper.text()).not.toContain("Daftar Kursus");
  });

  it("should load courses on mount and render stats and cards", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine, other] },
    });
    await tick();

    expect(coursesStore.asyncSetCourses).toHaveBeenCalled();
    expect(wrapper.text()).toContain("Daftar Kursus");
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("2");
    expect(wrapper.find('[data-testid="stat-mine"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="course-card-1"] img').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-card-2"] img').exists()).toBe(false);
  });

  it("should show a loading state while fetching and the empty state afterwards", async () => {
    let resolveFetch: () => void = () => {};
    (coursesStore.asyncSetCourses as any).mockImplementation(
      () => new Promise<void>((resolve) => (resolveFetch = resolve))
    );
    const { wrapper } = renderWithProviders(HomePage, { preloadedState: { profile, courses: [] } });
    await tick();
    expect(wrapper.text()).toContain("Memuat daftar kursus...");

    resolveFetch();
    await tick();
    expect(wrapper.text()).toContain("Belum ada kursus yang cocok.");
  });

  it("should filter by search query (title and description) and by ownership", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine, other] },
    });
    await tick();

    const search = wrapper.find('[data-testid="search-course-input"]');
    await search.setValue("dasar");
    expect(wrapper.find('[data-testid="course-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(false);

    await search.setValue("orang lain");
    expect(wrapper.find('[data-testid="course-card-1"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(true);

    await search.setValue("");
    await wrapper.find('[data-testid="filter-mine-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="course-card-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(false);

    await wrapper.find('[data-testid="filter-all-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="course-card-2"]').exists()).toBe(true);
  });

  it("should only show delete buttons for own courses and navigate to detail", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine, other] },
    });
    await tick();

    expect(wrapper.find('[data-testid="delete-course-1"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="delete-course-2"]').exists()).toBe(false);

    await wrapper.find('[data-testid="view-course-1"]').trigger("click");
    expect(mockGoto).toHaveBeenCalledWith("/courses/1");
  });

  it("should delete one course only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const { wrapper, coursesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine] },
    });
    const deleteSpy = vi.spyOn(store, "asyncSetIsCourseDelete").mockImplementation(async () => {});
    await tick();

    await wrapper.find('[data-testid="delete-course-1"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-course-1"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should delete all courses only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false } as any)
      .mockResolvedValueOnce({ isConfirmed: true } as any);
    const { wrapper, coursesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine] },
    });
    const deleteAllSpy = vi.spyOn(store, "asyncSetIsCourseDeleteAll").mockImplementation(async () => {});
    await tick();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).toHaveBeenCalled();
  });

  it("should reload the list after a delete or delete-all succeeded", async () => {
    const { coursesStore: store } = renderWithProviders(HomePage, {
      preloadedState: { profile, courses: [mine] },
    });
    await tick();
    const before = (coursesStore.asyncSetCourses as any).mock.calls.length;

    store.setIsCourseDeleted(true);
    await tick();
    expect(store.isCourseDeleted).toBe(false);
    expect((coursesStore.asyncSetCourses as any).mock.calls.length).toBe(before + 1);

    store.setIsCourseDeletedAll(true);
    await tick();
    expect(store.isCourseDeletedAll).toBe(false);
    expect((coursesStore.asyncSetCourses as any).mock.calls.length).toBe(before + 2);
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderWithProviders(HomePage, { preloadedState: { profile, courses: [] } });
    await tick();

    await wrapper.find('[data-testid="add-course-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="add-course-modal"]').exists()).toBe(false);
  });
});
