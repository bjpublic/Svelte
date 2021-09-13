<script>
  import { count } from './store.js';
</script>

<h1>현재 count는 {$count} 입니다.</h1>

<button on:click={count.increment}>+</button>
<button on:click={count.decrement}>-</button>
<button on:click={count.reset}>reset</button>
