<script>
  import "../index.css";
  let { children } = $props();
</script>

<!-- H1 tersembunyi untuk memenuhi syarat aksesibilitas -->
<h1 class="sr-only">Delcom Courses - Platform Pembelajaran Online</h1>

{@render children()}