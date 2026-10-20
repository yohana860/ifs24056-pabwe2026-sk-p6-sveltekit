import { writable } from "svelte/store";
import courseApi, { type Course, type CourseContent } from "../api/courseApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export interface CoursesState {
  courses: Course[];
  course: Course | null;
  content: CourseContent | null;
  isCourse: boolean;
  isCourseAdd: boolean;
  isCourseAdded: boolean;
  isCourseChange: boolean;
  isCourseChanged: boolean;
  isCourseChangeCover: boolean;
  isCourseChangedCover: boolean;
  isCourseDelete: boolean;
  isCourseDeleted: boolean;
  isCourseDeleteAll: boolean;
  isCourseDeletedAll: boolean;
  isCourseStudent: boolean;
  isCourseStudentDone: boolean;
  isCourseRating: boolean;
  isCourseRatingDone: boolean;
  isCourseContent: boolean;
  isCourseContentDone: boolean;
  isContent: boolean;
  isContentLearn: boolean;
  isContentLearned: boolean;
}

function createCoursesStore() {
  const initial: CoursesState = {
    courses: [],
    course: null,
    content: null,
    isCourse: false,
    isCourseAdd: false,
    isCourseAdded: false,
    isCourseChange: false,
    isCourseChanged: false,
    isCourseChangeCover: false,
    isCourseChangedCover: false,
    isCourseDelete: false,
    isCourseDeleted: false,
    isCourseDeleteAll: false,
    isCourseDeletedAll: false,
    isCourseStudent: false,
    isCourseStudentDone: false,
    isCourseRating: false,
    isCourseRatingDone: false,
    isCourseContent: false,
    isCourseContentDone: false,
    isContent: false,
    isContentLearn: false,
    isContentLearned: false,
  };

  let currentState: CoursesState = { ...initial };
  const innerStore = writable<CoursesState>(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  function patch(values: Partial<CoursesState>) {
    innerStore.update((s) => ({ ...s, ...values }));
  }

  return {
    subscribe: innerStore.subscribe,
    get courses() { return currentState.courses; },
    get course() { return currentState.course; },
    get content() { return currentState.content; },
    get isCourse() { return currentState.isCourse; },
    get isCourseAdd() { return currentState.isCourseAdd; },
    get isCourseAdded() { return currentState.isCourseAdded; },
    get isCourseChange() { return currentState.isCourseChange; },
    get isCourseChanged() { return currentState.isCourseChanged; },
    get isCourseChangeCover() { return currentState.isCourseChangeCover; },
    get isCourseChangedCover() { return currentState.isCourseChangedCover; },
    get isCourseDelete() { return currentState.isCourseDelete; },
    get isCourseDeleted() { return currentState.isCourseDeleted; },
    get isCourseDeleteAll() { return currentState.isCourseDeleteAll; },
    get isCourseDeletedAll() { return currentState.isCourseDeletedAll; },
    get isCourseStudent() { return currentState.isCourseStudent; },
    get isCourseStudentDone() { return currentState.isCourseStudentDone; },
    get isCourseRating() { return currentState.isCourseRating; },
    get isCourseRatingDone() { return currentState.isCourseRatingDone; },
    get isCourseContent() { return currentState.isCourseContent; },
    get isCourseContentDone() { return currentState.isCourseContentDone; },
    get isContent() { return currentState.isContent; },
    get isContentLearn() { return currentState.isContentLearn; },
    get isContentLearned() { return currentState.isContentLearned; },
    get $state() { return currentState; },
    reset(state: Partial<CoursesState> = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setCourses(courses: Course[]) { patch({ courses }); },
    setCourse(course: Course | null) { patch({ course }); },
    setContent(content: CourseContent | null) { patch({ content }); },
    setIsCourse(status: boolean) { patch({ isCourse: status }); },
    setIsCourseAdd(status: boolean) { patch({ isCourseAdd: status }); },
    setIsCourseAdded(status: boolean) { patch({ isCourseAdded: status }); },
    setIsCourseChange(status: boolean) { patch({ isCourseChange: status }); },
    setIsCourseChanged(status: boolean) { patch({ isCourseChanged: status }); },
    setIsCourseChangeCover(status: boolean) { patch({ isCourseChangeCover: status }); },
    setIsCourseChangedCover(status: boolean) { patch({ isCourseChangedCover: status }); },
    setIsCourseDelete(status: boolean) { patch({ isCourseDelete: status }); },
    setIsCourseDeleted(status: boolean) { patch({ isCourseDeleted: status }); },
    setIsCourseDeleteAll(status: boolean) { patch({ isCourseDeleteAll: status }); },
    setIsCourseDeletedAll(status: boolean) { patch({ isCourseDeletedAll: status }); },
    setIsCourseStudent(status: boolean) { patch({ isCourseStudent: status }); },
    setIsCourseStudentDone(status: boolean) { patch({ isCourseStudentDone: status }); },
    setIsCourseRating(status: boolean) { patch({ isCourseRating: status }); },
    setIsCourseRatingDone(status: boolean) { patch({ isCourseRatingDone: status }); },
    setIsCourseContent(status: boolean) { patch({ isCourseContent: status }); },
    setIsCourseContentDone(status: boolean) { patch({ isCourseContentDone: status }); },
    setIsContent(status: boolean) { patch({ isContent: status }); },
    setIsContentLearn(status: boolean) { patch({ isContentLearn: status }); },
    setIsContentLearned(status: boolean) { patch({ isContentLearned: status }); },
    async asyncSetCourses() {
      try {
        this.setCourses(await courseApi.getCourses());
      } catch {
        this.setCourses([]);
      }
    },
    async asyncSetCourse(courseId: string | number) {
      try {
        this.setCourse(await courseApi.getCourseById(courseId));
      } catch {
        this.setCourse(null);
      } finally {
        this.setIsCourse(true);
      }
    },
    async asyncSetContent(contentId: string | number) {
      try {
        this.setContent(await courseApi.getContentById(contentId));
      } catch {
        this.setContent(null);
      } finally {
        this.setIsContent(true);
      }
    },
    async asyncSetIsCourseAdd(title: string, description: string) {
      try {
        await courseApi.postCourse(title, description);
        showSuccessDialog("Kursus berhasil ditambahkan!");
        this.setIsCourseAdded(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseAdded(false);
      } finally {
        this.setIsCourseAdd(true);
      }
    },
    async asyncSetIsCourseChange(courseId: string | number, title: string, description: string) {
      try {
        const message = await courseApi.putCourse(courseId, title, description);
        showSuccessDialog(message || "Kursus berhasil diperbarui!");
        this.setIsCourseChanged(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseChanged(false);
      } finally {
        this.setIsCourseChange(true);
      }
    },
    async asyncSetIsCourseChangeCover(courseId: string | number, cover: File) {
      try {
        const message = await courseApi.postCourseCover(courseId, cover);
        showSuccessDialog(message || "Sampul berhasil diperbarui!");
        this.setIsCourseChangedCover(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseChangedCover(false);
      } finally {
        this.setIsCourseChangeCover(true);
      }
    },
    async asyncSetIsCourseDelete(courseId: string | number) {
      try {
        const message = await courseApi.deleteCourse(courseId);
        showSuccessDialog(message || "Kursus berhasil dihapus!");
        this.setIsCourseDeleted(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseDeleted(false);
      } finally {
        this.setIsCourseDelete(true);
      }
    },
    async asyncSetIsCourseDeleteAll() {
      try {
        const message = await courseApi.deleteAllCourses();
        showSuccessDialog(message || "Semua kursus berhasil dihapus!");
        this.setIsCourseDeletedAll(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseDeletedAll(false);
      } finally {
        this.setIsCourseDeleteAll(true);
      }
    },
    async _mutateStudent(action: () => Promise<string>, fallbackMessage: string) {
      try {
        const message = await action();
        showSuccessDialog(message || fallbackMessage);
        this.setIsCourseStudentDone(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseStudentDone(false);
      } finally {
        this.setIsCourseStudent(true);
      }
    },
    asyncSetIsCourseJoin(courseId: string | number) {
      return this._mutateStudent(() => courseApi.postStudent(courseId), "Berhasil mendaftar ke kursus!");
    },
    asyncSetIsCourseLeave(courseId: string | number) {
      return this._mutateStudent(() => courseApi.deleteStudent(courseId), "Berhasil keluar dari kursus!");
    },
    async asyncSetIsCourseRating(courseId: string | number, rating: number, comment: string) {
      try {
        const message = await courseApi.postRating(courseId, rating, comment);
        showSuccessDialog(message || "Rating berhasil dikirim!");
        this.setIsCourseRatingDone(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseRatingDone(false);
      } finally {
        this.setIsCourseRating(true);
      }
    },
    async _mutateContent(action: () => Promise<string>, fallbackMessage: string) {
      try {
        const message = await action();
        showSuccessDialog(message || fallbackMessage);
        this.setIsCourseContentDone(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsCourseContentDone(false);
      } finally {
        this.setIsCourseContent(true);
      }
    },
    asyncSetIsCourseContentAdd(courseId: string | number, title: string, youtube: string) {
      return this._mutateContent(
        () => courseApi.postContent(courseId, title, youtube),
        "Konten berhasil ditambahkan!"
      );
    },
    asyncSetIsCourseContentChange(contentId: string | number, title: string, youtube: string) {
      return this._mutateContent(
        () => courseApi.putContent(contentId, title, youtube),
        "Konten berhasil diperbarui!"
      );
    },
    asyncSetIsCourseContentDelete(contentId: string | number) {
      return this._mutateContent(
        () => courseApi.deleteContent(contentId),
        "Konten berhasil dihapus!"
      );
    },
    async asyncSetIsContentLearn(contentId: string | number, status: 0 | 1) {
      try {
        const message = await courseApi.putContentLearn(contentId, status);
        showSuccessDialog(message || "Status belajar diperbarui!");
        this.setIsContentLearned(true);
      } catch (error: any) {
        showErrorDialog(error.message);
        this.setIsContentLearned(false);
      } finally {
        this.setIsContentLearn(true);
      }
    },
  };
}

export const coursesStore = createCoursesStore();
export const useCoursesStore = () => coursesStore;
export default coursesStore;
