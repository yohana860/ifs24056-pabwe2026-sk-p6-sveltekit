<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ContentModal from "../modals/ContentModal.svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { isCourseStudent } from "../utils/youtube";
  import { showConfirmDialog, showErrorDialog } from "../../../helpers/toolsHelper";
  import type { CourseContent } from "../api/courseApi";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Plus,
    Pencil,
    Video,
    Lock,
    Star,
    UserPlus,
    UserMinus,
  } from "lucide-svelte";

  export let courseId: string;

  $: profile = $usersStore.profile;
  $: course = $coursesStore.course;
  // Antarmuka pemilik didahulukan bila pengguna pemilik sekaligus peserta.
  $: isOwner = !!profile && !!course && course.user_id === profile.id;
  $: isStudent = !isOwner && !!profile && !!course && isCourseStudent(course.students, profile.id);
  $: contents = course && course.contents ? course.contents : [];
  $: studentCount = course && course.students ? course.students.length : 0;

  let showCoverModal: boolean = false;
  let showEditModal: boolean = false;
  let showContentModal: boolean = false;
  let selectedContent: CourseContent | null = null;
  let rating: number = 5;
  let comment: string = "";

  onMount(() => {
    coursesStore.asyncSetCourse(courseId);
  });

  let prevId = courseId;
  $: if (courseId !== prevId) {
    prevId = courseId;
    coursesStore.asyncSetCourse(courseId);
  }

  $: if ($coursesStore.isCourse) {
    coursesStore.setIsCourse(false);
    if (!course) {
      goto("/");
    }
  }

  $: if ($coursesStore.isCourseDeleted) {
    coursesStore.setIsCourseDeleted(false);
    goto("/");
  }

  $: if ($coursesStore.isCourseStudent) {
    coursesStore.setIsCourseStudent(false);
    if ($coursesStore.isCourseStudentDone) {
      coursesStore.setIsCourseStudentDone(false);
      coursesStore.asyncSetCourse(courseId);
    }
  }

  $: if ($coursesStore.isCourseRating) {
    coursesStore.setIsCourseRating(false);
    if ($coursesStore.isCourseRatingDone) {
      coursesStore.setIsCourseRatingDone(false);
      comment = "";
      coursesStore.asyncSetCourse(courseId);
    }
  }

  $: if ($coursesStore.isCourseContent) {
    coursesStore.setIsCourseContent(false);
  }

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDelete(course.id);
    }
  }

  function handleJoin() {
    coursesStore.asyncSetIsCourseJoin(course.id);
  }

  async function handleLeave() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin keluar dari kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseLeave(course.id);
    }
  }

  function handleRating() {
    if (rating < 1 || rating > 5) {
      showErrorDialog("Rating harus bernilai 1 sampai 5");
      return;
    }
    coursesStore.asyncSetIsCourseRating(course.id, rating, comment.trim());
  }

  function openAddContent() {
    selectedContent = null;
    showContentModal = true;
  }

  function openEditContent(content: CourseContent) {
    selectedContent = content;
    showContentModal = true;
  }

  async function handleDeleteContent(content: CourseContent) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus konten ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseContentDelete(content.id);
    }
  }
</script>

{#if !profile || !course}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-courses-link"
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Kursus
      </a>

      {#if isOwner}
        <div class="flex items-center gap-2">
          <button
            type="button"
            data-testid="edit-cover-btn"
            on:click={() => (showCoverModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
          >
            <ImagePlus size={16} />
            Ubah Sampul
          </button>
          <button
            type="button"
            data-testid="edit-detail-course-btn"
            on:click={() => (showEditModal = true)}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            <PenLine size={16} />
            Ubah Data
          </button>
          <button
            type="button"
            data-testid="delete-detail-course-btn"
            on:click={handleDelete}
            class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
          >
            <Trash2 size={16} />
            Hapus
          </button>
        </div>
      {/if}
    </div>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if course.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img src={course.cover} alt={course.title} class="w-full h-full object-cover" />
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-2">
          <span class="font-mono text-xs font-bold text-slate-400">{"#" + course.id}</span>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {course.title}
          </h1>
          <p data-testid="course-student-count" class="text-xs text-slate-500">
            {`${studentCount} peserta`}
          </p>
        </div>

        <p
          data-testid="course-detail-description"
          class="text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 leading-relaxed whitespace-pre-line"
        >
          {course.description}
        </p>

        {#if !isOwner}
          <div class="flex flex-wrap items-center gap-3">
            {#if isStudent}
              <button
                type="button"
                data-testid="leave-course-btn"
                on:click={handleLeave}
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
              >
                <UserMinus size={16} />
                Keluar dari Kursus
              </button>
            {:else}
              <button
                type="button"
                data-testid="join-course-btn"
                on:click={handleJoin}
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-colors"
              >
                <UserPlus size={16} />
                Daftar Kursus
              </button>
            {/if}
          </div>
        {/if}

        {#if isStudent}
          <form
            on:submit|preventDefault={handleRating}
            data-testid="rating-form"
            class="space-y-3 p-5 rounded-2xl border border-slate-200 bg-white"
          >
            <h2 class="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Star size={16} /> Beri Rating
            </h2>
            <div class="flex flex-col sm:flex-row gap-3">
              <select
                aria-label="Rating"
                data-testid="rating-select"
                bind:value={rating}
                class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
              <input
                type="text"
                aria-label="Komentar"
                data-testid="rating-comment-input"
                bind:value={comment}
                placeholder="Komentar (opsional)"
                class="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="submit"
                data-testid="submit-rating-btn"
                class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Kirim
              </button>
            </div>
          </form>
        {/if}

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-800">Daftar Konten</h2>
            {#if isOwner}
              <button
                type="button"
                data-testid="add-content-btn"
                on:click={openAddContent}
                class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-colors"
              >
                <Plus size={16} />
                Tambah Konten
              </button>
            {/if}
          </div>

          {#if contents.length === 0}
            <div data-testid="contents-empty" class="text-center py-8 text-slate-400">
              <Video size={32} class="mx-auto text-slate-300 mb-2" />
              <p class="text-sm font-medium">Belum ada konten.</p>
            </div>
          {:else}
            <ul class="space-y-2">
              {#each contents as content (content.id)}
                <li
                  data-testid={`content-row-${content.id}`}
                  class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-white"
                >
                  {#if isOwner || isStudent}
                    <a
                      href={`/courses/${course.id}/contents/${content.id}`}
                      class="flex items-center gap-3 min-w-0 text-sm font-semibold text-slate-700 hover:text-indigo-600"
                    >
                      <Video size={16} class="shrink-0 text-slate-400" />
                      <span class="truncate">{content.title}</span>
                    </a>
                  {:else}
                    <span class="flex items-center gap-3 min-w-0 text-sm font-semibold text-slate-400">
                      <Lock size={16} class="shrink-0" />
                      <span class="truncate">{content.title}</span>
                    </span>
                  {/if}
                  {#if isOwner}
                    <div class="inline-flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        data-testid={`edit-content-${content.id}`}
                        on:click={() => openEditContent(content)}
                        class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Ubah Konten"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        data-testid={`delete-content-${content.id}`}
                        on:click={() => handleDeleteContent(content)}
                        class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Konten"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>

    <ChangeCoverModal
      show={showCoverModal}
      {course}
      onClose={() => (showCoverModal = false)}
      on:close={() => (showCoverModal = false)}
    />

    <ChangeModal
      show={showEditModal}
      {course}
      onClose={() => (showEditModal = false)}
      on:close={() => (showEditModal = false)}
    />

    <ContentModal
      show={showContentModal}
      courseId={course.id}
      content={selectedContent}
      onClose={() => (showContentModal = false)}
      on:close={() => (showContentModal = false)}
    />
  </div>
{/if}
