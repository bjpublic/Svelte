<script>
  import { meta } from 'tinro';
  const route = meta();  
  let param = route.params._id;

</script>

<b>Sub Content</b>
<p>param: {param}</p>
<p>현재 url: {route.url}</p>
<p>이전 url: {route.from}</p>