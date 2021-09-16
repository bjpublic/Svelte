<script>
  import { count } from './store.js';

  const decrement = () => count.update(count => count - 1);
  
  // 위의 한줄 코드와 아래 코드는 같은 내용의 코드임
  //  function decrement() {
  //    count.update(count => {
  //      count = count -1;
  //      return count
  //    }
  //  }
  
</script>

<button on:click={decrement}>
  -
</button>
