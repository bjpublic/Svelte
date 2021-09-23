<script>
import Child from './child.svelte';
let count  = 0;
  
const handleClick = () => count = count + 1;  
</script>

<Child carryValue={count} handleClick={handleClick} />
