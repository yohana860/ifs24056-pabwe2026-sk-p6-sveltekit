import { describe, it, expect, vi, beforeEach } from "vitest";
import CourseLayout from "./CourseLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import { mockGoto } from "../../../setupTests";
import apiHelper from "../../../helpers/apiHelper";
import { usersStore } from "../../users/states/usersStore";

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("CourseLayout", () => {
  const profile = { id: 1, name: "Test User", email: "test@delcom.org" } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
  });

  it("should redirect to login if the access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(CourseLayout, { preloadedState: { profile: null } });

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    expect(usersStore.asyncSetProfile).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should load the profile when a token exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    renderWithProviders(CourseLayout, { preloadedState: { profile: null } });

    expect(usersStore.asyncSetProfile).toHaveBeenCalled();
  });

  it("should render navbar and sidebar, toggle the sidebar and logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(CourseLayout, {
      preloadedState: { profile },
    });

    expect(wrapper.text()).toContain("Delcom Courses");
    expect(wrapper.text()).toContain("Test User");

    await wrapper.find('[data-testid="toggle-sidebar-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(true);

    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="sidebar-backdrop"]').exists()).toBe(false);

    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(async () => {});
    await wrapper.find('[data-testid="profile-dropdown-button"]').trigger("click");
    await wrapper.find('[data-testid="dropdown-logout-button"]').trigger("click");
    await tick();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("should stay on the page when isProfile is triggered and the profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, usersStore: store } = renderWithProviders(CourseLayout, {
      preloadedState: { profile },
    });
    mockGoto.mockClear();

    store.setIsProfile(true);
    await tick();

    expect(mockGoto).not.toHaveBeenCalled();
    expect(store.isProfile).toBe(false);
    expect(wrapper.text()).toContain("Test User");
  });

  it("should clear the token and redirect when isProfile is triggered without a profile", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

    const { usersStore: store } = renderWithProviders(CourseLayout, {
      preloadedState: { profile: null },
    });
    mockGoto.mockClear();

    store.setIsProfile(true);
    await tick();

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login and clear the profile when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { authStore, usersStore: store } = renderWithProviders(CourseLayout, {
      preloadedState: { profile },
    });
    mockGoto.mockClear();

    authStore.setIsAuthLogout(true);
    await tick();

    expect(mockGoto).toHaveBeenCalledWith("/auth/login");
    expect(authStore.isAuthLogout).toBe(false);
    expect(store.profile).toBeNull();
  });
});
