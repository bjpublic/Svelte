<script>

import { onMount, onDestroy, beforeUpdate, afterUpdate, tick } from 'svelte';
import Child from './child.svelte';

onMount(async() => {
  console.log('App onMount');
});

onDestroy(async() => {
  console.log('App onDestroy');
});

beforeUpdate(async() => {
  console.log('App beforeUpdate');
});

afterUpdate(async() => {
  console.log('App afterUpdate');
});

</script>

<h1>부모 컴포넌트</h1>
<Child />
