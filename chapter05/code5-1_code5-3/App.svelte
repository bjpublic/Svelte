<script>
import { setContext } from 'svelte';
import Panel from './panel.svelte';

let count = 10;

function incrementCount(event) {
  count ++;
}

setContext('incrementCount', incrementCount);
setContext('count', count);

</script>

<Panel {count} />