<script>
  export let count;
  export let handleClick;
  
  import Child from './child.svelte';
  
</script>

<Child {count} {handleClick} />
