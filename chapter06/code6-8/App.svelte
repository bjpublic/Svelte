<script>
  import { fade, blur, fly, slide, scale, draw } from 'svelte/transition';
  
  let visible = false
  
</script>

<label>
  <input type="checkbox" bind:checked={visible} /> 
  효과 보기
</label>

{#if visible}
  <div transition:scale="{{start:10}}" class="wrap">
    transiton 예제
  </div>
{/if}

<style>
  .wrap {
    padding: 20px;
    background-color: #288EDD;
    text-align: center;
  }
</style>
