<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import AddModal from "../modals/AddModal.svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";
  import type { Course } from "../api/courseApi";
  import {
    Plus,
    GraduationCap,
    User,
    Eye,
    Trash2,
    Funnel,
    Search,
    LoaderCircle,
  } from "lucide-svelte";

  let loading: boolean = false;
  let onlyMine: boolean = false;
  let searchQuery: string = "";
  let showAddModal: boolean = false;

  $: profile = $usersStore.profile;
  $: courses = $coursesStore.courses;

  onMount(() => {
    loadCourses();
  });

  function loadCourses() {
    loading = true;
    Promise.resolve(coursesStore.asyncSetCourses()).finally(() => {
      loading = false;
    });
  }

  $: if ($coursesStore.isCourseDeleted) {
    coursesStore.setIsCourseDeleted(false);
    loadCourses();
  }

  $: if ($coursesStore.isCourseDeletedAll) {
    coursesStore.setIsCourseDeletedAll(false);
    loadCourses();
  }

  async function handleDelete(courseId: number | string) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus kursus ini?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDelete(courseId);
    }
  }

  async function handleDeleteAll() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus SEMUA kursus?");
    if (result.isConfirmed) {
      coursesStore.asyncSetIsCourseDeleteAll();
    }
  }

  function isMine(course: Course): boolean {
    return course.user_id === profile.id;
  }

  $: filteredCourses = courses.filter((course: Course) => {
    if (onlyMine && !isMine(course)) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
    );
  });

  $: totalCount = courses.length;
  $: mineCount = profile ? courses.filter((c: Course) => c.user_id === profile.id).length : 0;
</script>

{#if profile}
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Kursus
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Temukan, ikuti, dan kelola kursus video pilihan Anda.
        </p>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          type="button"
          data-testid="delete-all-btn"
          on:click={handleDeleteAll}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-all"
        >
          <Trash2 size={18} />
          <span>Hapus Semua</span>
        </button>
        <button
          type="button"
          data-testid="add-course-btn"
          on:click={() => (showAddModal = true)}
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Tambah Kursus</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kursus</p>
          <!-- FIX: h3 diganti p -->
          <p data-testid="stat-total" class="text-3xl font-black text-slate-800 mt-1">{totalCount}</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <GraduationCap size={26} />
        </div>
      </div>
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Milik Saya</p>
          <!-- FIX: h3 diganti p -->
          <p data-testid="stat-mine" class="text-3xl font-black text-emerald-600 mt-1">{mineCount}</p>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <User size={26} />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <Search size={18} class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            aria-label="Cari kursus"
            data-testid="search-course-input"
            bind:value={searchQuery}
            placeholder="Cari judul atau deskripsi kursus..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Funnel size={16} /> Filter:
          </span>
          <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            <button
              type="button"
              data-testid="filter-all-btn"
              on:click={() => (onlyMine = false)}
              class="px-3 py-1.5 rounded-lg transition-all {!onlyMine ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}"
            >
              Semua
            </button>
            <button
              type="button"
              data-testid="filter-mine-btn"
              on:click={() => (onlyMine = true)}
              class="px-3 py-1.5 rounded-lg transition-all {onlyMine ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-slate-900'}"
            >
              Milik Saya
            </button>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-5">
        {#if loading && filteredCourses.length === 0}
          <div class="py-12 text-center text-slate-400">
            <LoaderCircle size={36} class="mx-auto text-indigo-600 animate-spin mb-2" />
            <p class="font-medium text-slate-600">Memuat daftar kursus...</p>
          </div>
        {:else if filteredCourses.length === 0}
          <div class="py-12 text-center text-slate-400">
            <GraduationCap size={40} class="mx-auto text-slate-300 mb-2" />
            <p class="font-medium">Belum ada kursus yang cocok.</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {#each filteredCourses as course (course.id)}
              <div
                data-testid={`course-card-${course.id}`}
                class="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col"
              >
                {#if course.cover}
                  <img src={course.cover} alt={course.title} class="w-full h-36 object-cover" />
                {/if}
                <div class="p-4 flex-1 flex flex-col gap-2">
                  <span class="font-mono text-xs font-bold text-slate-400">{"#" + course.id}</span>
                  <p class="font-bold text-slate-800 leading-snug">{course.title}</p>
                  <p class="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                  <div class="mt-auto pt-3 inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      data-testid={`view-course-${course.id}`}
                      on:click={() => goto(`/courses/${course.id}`)}
                      class="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Lihat Detail"
                    >
                      <Eye size={18} />
                    </button>
                    {#if isMine(course)}
                      <button
                        type="button"
                        data-testid={`delete-course-${course.id}`}
                        on:click={() => handleDelete(course.id)}
                        class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Kursus"
                      >
                        <Trash2 size={18} />
                      </button>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <AddModal show={showAddModal} on:close={() => (showAddModal = false)} />
  </div>
{/if}