<script>
import Child from './child.svelte';
let count  = 0;
  
const handleClick = () => count = count + 1;  
</script>

<Child carryValue = {count} />

<button on:click={handleClick}>클릭</button>
