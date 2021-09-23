<script>
  import { count } from './store.js';
  import Increment from './increment.svelte';
  import Decrement from './decrement.svelte';
  import Reset from './reset.svelte';

  // let count_value;

  // const unsubscribe = count.subscribe(value => {
  //   count_value = value;
  // });
</script>

<!-- <h1>현재 count는 {count_value}</h1>

<Increment />
<Decrement />
<Reset /> -->
<h1>현재 count는 {$count} 입니다.</h1>

<Increment/>
<Decrement/>
<Reset/>
