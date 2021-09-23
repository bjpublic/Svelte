<script>
  import { spring } from 'svelte/motion';

  // let coords = spring({ x: 50, y: 50 }, {
  // });
  let coords = spring({ x: 50, y: 50 }, {
    stiffness: 0.2,
    demping: 0.5
  });

</script>

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
