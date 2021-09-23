<script>
  import { count } from './store.js';

  function increment() {
    count.update(count => {
      count = count + 1;
      return count;
    })
  }

  
</script>

<button on:click={increment}>
  +
</button>
