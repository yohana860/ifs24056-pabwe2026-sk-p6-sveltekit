const YOUTUBE_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

export function getYoutubeEmbedUrl(url: string): string | null {
  const match = YOUTUBE_ID.exec(url);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function isCourseStudent(
  students: Array<{ id: number | string } | number | string> | undefined,
  profileId: number | string
): boolean {
  if (!students) return false;
  return students.some((student) =>
    typeof student === "object" ? student.id === profileId : student === profileId
  );
}
