<script>
  export let count
  
  const increNum = () => count = Number(count) + 1;
</script>

<button on:click={increNum}>Increment</button>
