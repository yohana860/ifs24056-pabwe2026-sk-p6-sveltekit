import apiHelper from "../../../helpers/apiHelper";

declare const DELCOM_BASEURL: string;

export interface CourseStudent {
  id: number | string;
  name?: string;
}

export interface CourseContent {
  id: number | string;
  course_id?: number | string;
  title: string;
  youtube: string;
  learned?: boolean | number;
  created_at?: string;
  updated_at?: string;
}

export interface Course {
  id: number | string;
  user_id: number | string;
  title: string;
  description: string;
  cover?: string | null;
  students?: Array<CourseStudent | number | string>;
  contents?: CourseContent[];
  created_at?: string;
  updated_at?: string;
}

const courseApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/courses`;

  function _url(path: string): string {
    return BASE_URL + path;
  }

  async function _request(path: string, options: RequestInit, fallbackMessage: string): Promise<any> {
    const response = await apiHelper.fetchData(_url(path), options);
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  function _json(method: string, payload: Record<string, unknown>): RequestInit {
    return {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };
  }

  async function postCourse(title: string, description: string): Promise<any> {
    const result = await _request("/", _json("POST", { title, description }), "Gagal menambahkan kursus");
    return result.data;
  }

  async function postCourseCover(courseId: string | number, cover: File): Promise<string> {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const result = await _request(
      `/${courseId}/cover`,
      { method: "POST", body: formData },
      "Gagal mengubah sampul"
    );
    return result.message;
  }

  async function putCourse(
    courseId: string | number,
    title: string,
    description: string
  ): Promise<string> {
    const result = await _request(
      `/${courseId}`,
      _json("PUT", { title, description }),
      "Gagal mengubah kursus"
    );
    return result.message;
  }

  async function getCourses(): Promise<Course[]> {
    const result = await _request("/", { method: "GET" }, "Gagal mengambil data kursus");
    return result.data.courses || [];
  }

  async function getCourseById(courseId: string | number): Promise<Course> {
    const result = await _request(`/${courseId}`, { method: "GET" }, "Gagal mengambil detail kursus");
    return result.data.course;
  }

  async function deleteCourse(courseId: string | number): Promise<string> {
    const result = await _request(`/${courseId}`, { method: "DELETE" }, "Gagal menghapus kursus");
    return result.message;
  }

  async function deleteAllCourses(): Promise<string> {
    const result = await _request("/", { method: "DELETE" }, "Gagal menghapus semua kursus");
    return result.message;
  }

  async function postStudent(courseId: string | number): Promise<string> {
    const result = await _request(
      `/${courseId}/students`,
      { method: "POST" },
      "Gagal mendaftar ke kursus"
    );
    return result.message;
  }

  async function deleteStudent(courseId: string | number): Promise<string> {
    const result = await _request(
      `/${courseId}/students`,
      { method: "DELETE" },
      "Gagal keluar dari kursus"
    );
    return result.message;
  }

  async function postRating(
    courseId: string | number,
    rating: number,
    comment: string
  ): Promise<string> {
    const result = await _request(
      `/${courseId}/ratings`,
      _json("POST", { rating, comment }),
      "Gagal memberi rating"
    );
    return result.message;
  }

  async function postContent(
    courseId: string | number,
    title: string,
    youtube: string
  ): Promise<string> {
    const result = await _request(
      `/${courseId}/contents`,
      _json("POST", { title, youtube }),
      "Gagal menambahkan konten"
    );
    return result.message;
  }

  async function putContent(
    contentId: string | number,
    title: string,
    youtube: string
  ): Promise<string> {
    const result = await _request(
      `/-/contents/${contentId}`,
      _json("PUT", { title, youtube }),
      "Gagal mengubah konten"
    );
    return result.message;
  }

  async function getContentById(contentId: string | number): Promise<CourseContent> {
    const result = await _request(
      `/-/contents/${contentId}`,
      { method: "GET" },
      "Gagal mengambil detail konten"
    );
    return result.data.course_content;
  }

  async function deleteContent(contentId: string | number): Promise<string> {
    const result = await _request(
      `/-/contents/${contentId}`,
      { method: "DELETE" },
      "Gagal menghapus konten"
    );
    return result.message;
  }

  async function putContentLearn(contentId: string | number, status: 0 | 1): Promise<string> {
    const result = await _request(
      `/-/contents/${contentId}/learns`,
      _json("PUT", { status }),
      "Gagal mengubah status belajar"
    );
    return result.message;
  }

  return {
    postCourse,
    postCourseCover,
    putCourse,
    getCourses,
    getCourseById,
    deleteCourse,
    deleteAllCourses,
    postStudent,
    deleteStudent,
    postRating,
    postContent,
    putContent,
    getContentById,
    deleteContent,
    putContentLearn,
  };
})();

export default courseApi;
