<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });

  function changeProgress(value) {
    progress.set(value)
  }
</script>

<progress value={$progress}></progress>
<button on:click="{() => changeProgress(0)}">0%</button>
<button on:click="{() => changeProgress(0.25)}">25%</button>
<button on:click="{() => changeProgress(0.5)}">50%</button>
<button on:click="{() => changeProgress(0.75)}">75%</button>
<button on:click="{() => changeProgress(1)}">100%</button>

<style>
  progress {
    display: block;
    width: 100%;
  }
</style>
