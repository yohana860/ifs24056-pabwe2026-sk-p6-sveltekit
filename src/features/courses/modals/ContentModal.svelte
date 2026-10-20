<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Video, X, LoaderCircle } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import { getYoutubeEmbedUrl } from "../utils/youtube";
  import type { CourseContent } from "../api/courseApi";

  export let show: boolean = false;
  export let courseId: number | string | null = null;
  export let content: CourseContent | null = null;
  export let onClose: (() => void) | undefined = undefined;

  const dispatch = createEventDispatcher();

  let loading: boolean = false;
  let title: string = "";
  let youtube: string = "";
  let loadedKey: string | null = null;

  function handleClose() {
    loadedKey = null;
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if (show && loadedKey === null) {
    loadedKey = content ? `content-${content.id}` : "new";
    title = content ? content.title : "";
    youtube = content ? content.youtube : "";
  }

  $: if ($coursesStore.isCourseContent) {
    loading = false;
    coursesStore.setIsCourseContent(false);
    if ($coursesStore.isCourseContentDone) {
      coursesStore.setIsCourseContentDone(false);
      coursesStore.asyncSetCourse(courseId);
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul konten tidak boleh kosong");
      return;
    }

    if (!getYoutubeEmbedUrl(youtube.trim())) {
      showErrorDialog("Tautan YouTube tidak valid");
      return;
    }

    loading = true;
    if (content) {
      coursesStore.asyncSetIsCourseContentChange(content.id, title.trim(), youtube.trim());
    } else {
      coursesStore.asyncSetIsCourseContentAdd(courseId, title.trim(), youtube.trim());
    }
  }
</script>

{#if show}
  <div
    data-testid="content-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Video size={18} strokeWidth={2.5} />
          </div>
          <h3 class="text-base font-bold text-slate-800">
            {content ? "Ubah Konten" : "Tambah Konten"}
          </h3>
        </div>
        <button
          type="button"
          data-testid="close-content-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="content-title-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Konten <span class="text-red-500">*</span>
          </label>
          <input
            id="content-title-input"
            type="text"
            data-testid="content-title-input"
            bind:value={title}
            placeholder="Contoh: Pengenalan HTML"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div>
          <label for="content-youtube-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Tautan YouTube <span class="text-red-500">*</span>
          </label>
          <input
            id="content-youtube-input"
            type="url"
            data-testid="content-youtube-input"
            bind:value={youtube}
            placeholder="https://www.youtube.com/watch?v=..."
            class="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-content-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-content-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <span>Simpan Konten</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
