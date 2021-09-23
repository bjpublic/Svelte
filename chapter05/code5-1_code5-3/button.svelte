<script>
import { getContext } from 'svelte'

let handleIncrementCount = getContext('incrementCount')
let count = getContext('count')
</script>

<button on:click={handleIncrementCount} >
  count 초기값: [{count}]
</button>