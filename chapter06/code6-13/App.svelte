<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // const size = tweened(10);
  const size = tweened(10,{ // 수정
    duration: 500,
    easing: cubicOut
  });


  function handleSizeUp() {
    $size += 50;
  }
</script>

<div on:click={handleSizeUp} style="padding:{$size}px;" class="wrap">
  점점크게
</div>

<style>
  .wrap {
    float: left;
    background-color: #eeeeee;
    border: 1px solid #333333;
  }
</style>
