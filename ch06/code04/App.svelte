<script>
  import { fade, blur, fly, slide, scale, draw } from 'svelte/transition';
  import { quintIn, backOut } from 'svelte/easing'; 
  let visible = false
</script>

<label>
  <input type="checkbox" bind:checked={visible} /> 
  효과 보기
</label>

{#if visible}
  <div transition:fade={{easing: quintIn}} class="wrap" >
    <h1>transiton 예제</h1>
  </div>
{/if}

<style>
  .wrap {
    padding: 20px;
    background-color: #288EDD;
    text-align: center;
  }
</style>
