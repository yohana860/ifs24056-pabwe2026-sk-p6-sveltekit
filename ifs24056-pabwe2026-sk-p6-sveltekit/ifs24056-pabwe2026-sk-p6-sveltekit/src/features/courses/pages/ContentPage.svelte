<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ArrowLeft, CircleCheck, Circle, Video } from "lucide-svelte";
  import { coursesStore } from "../states/coursesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { getYoutubeEmbedUrl } from "../utils/youtube";

  export let courseId: string;
  export let contentId: string;

  $: profile = $usersStore.profile;
  $: content = $coursesStore.content;
  $: embedUrl = content ? getYoutubeEmbedUrl(content.youtube) : null;
  $: isLearned = !!content && Number(content.learned) === 1;

  onMount(() => {
    coursesStore.asyncSetContent(contentId);
  });

  $: if ($coursesStore.isContent) {
    coursesStore.setIsContent(false);
    if (!content) {
      goto(`/courses/${courseId}`);
    }
  }

  $: if ($coursesStore.isContentLearn) {
    coursesStore.setIsContentLearn(false);
    if ($coursesStore.isContentLearned) {
      coursesStore.setIsContentLearned(false);
      coursesStore.asyncSetContent(contentId);
    }
  }

  function toggleLearned() {
    coursesStore.asyncSetIsContentLearn(contentId, isLearned ? 0 : 1);
  }
</script>

{#if !profile || !content}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto">
    <a
      href={`/courses/${courseId}`}
      data-testid="back-to-course-link"
      class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
    >
      <ArrowLeft size={18} />
      Kembali ke Kursus
    </a>

    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if embedUrl}
        <div class="aspect-video w-full bg-slate-900">
          <iframe
            data-testid="content-player"
            title={content.title}
            src={embedUrl}
            class="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      {:else}
        <div data-testid="content-fallback" class="p-8 text-center text-slate-500">
          <Video size={32} class="mx-auto text-slate-300 mb-2" />
          <a href={content.youtube} target="_blank" rel="noopener noreferrer" class="text-indigo-600 font-semibold">
            Buka video di YouTube
          </a>
        </div>
      {/if}

      <div class="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          {content.title}
        </h1>
        <button
          type="button"
          data-testid="toggle-learned-btn"
          on:click={toggleLearned}
          class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors {isLearned ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-white bg-indigo-600 hover:bg-indigo-700'}"
        >
          {#if isLearned}
            <CircleCheck size={16} />
            Sudah Selesai
          {:else}
            <Circle size={16} />
            Tandai Selesai
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
