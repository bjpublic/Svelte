<script>
  import { Route } from 'tinro';
  import SubContent from '../components/SubContent.svelte';
  
</script>
<div class="main">
  <h1>About Page</h1>
  <a href="/about/sub/123">Sub</a>

  <hr />

  <Route path="/sub/:_id">
    <SubContent />
  </Route>

  <hr /> 
</div>