<script>
  import { spring } from 'svelte/motion';

  let coords = spring({ x: 50, y: 50 }, {
    stiffness: 0.2,
    demping: 0.5    
  });
</script>

<!-- range 추가 -->
<div style="position: absolute; right: 1em;">
  <label>
    <h3>stiffness ({coords.stiffness})</h3>
    <input bind:value={coords.stiffness} type="range" min="0" max="1" step="0.01">
  </label>

  <label>
    <h3>damping ({coords.damping})</h3>
    <input bind:value={coords.damping} type="range" min="0" max="1" step="0.01">
  </label>
</div>
<!-- range 추가 -->

<svg on:mousemove="{e => coords.set({ x: e.clientX, y: e.clientY })}">
  <circle cx={$coords.x} cy={$coords.y} r=20/>
</svg>

<style>
  svg {
    width: 100%;
    height: 100%;
  }
  circle {
    fill: #ff3e00;
  }
</style>
