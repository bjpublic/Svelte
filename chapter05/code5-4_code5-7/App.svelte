<script>
import First from './first.svelte'

let value = 0

function handleValueAdd(event) {
  console.log(event.detail.message);
  value = value + event.detail.value
}
</script>

<p>value : {value}</p> 

<First on:add={handleValueAdd}  />