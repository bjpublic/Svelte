<script>
import Middle from './middle.svelte';
let count  = 0;
  
const handleClick = () => count = count + 1;  
</script>

<Middle {count} {handleClick} />
