<script>
  import {crossfade} from 'svelte/transition';
  const [send, receive] = crossfade({});
  
  let left = ['사과', '바나나', '복숭아', '포도'];
  let right = ['레몬', '참외'];
  
  function move(item, from, to) {
    to = [...to, item];
    from = from.filter(i => i !== item);
    return [from, to];
  }
  
  function moveLeft(item) {
    [right, left] = move(item, right, left);
  }
  
  function moveRight(item) {
    [left, right] = move(item, left, right);
  }
</script>

<main>
  <p>버튼을 클릭해 위치를 이동해 보세요.</p>
  <!-- left 영역 -->
  <div class="list">
    {#each left as item (item)}
      <button
        in:receive={{key: item}}
        out:send={{key: item}}
        on:click={() => moveRight(item)}
      >
        {item}
      </button>
    {/each}
  </div>
  <!-- right 영역 -->
  <div class="list">
    {#each right as item (item)}
      <button
        in:receive={{key: item}}
        out:send={{key: item}}
        on:click={() => moveLeft(item)}
      >
        {item}
      </button>
    {/each}
  </div>
</main>

<style> 
  button {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
    background-color: orange;
    border: none;
    color: white;
  }
  
  .list {
    width: 70px;
    margin-right: 100px;
    display: inline-block;
    vertical-align: top;
  }

</style>
