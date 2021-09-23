<script>
  import {router } from 'tinro';
  const goHome = () => router.goto('/home');

</script>
  <div class="main">
  <h1>Contacts Page</h1>
  <p class="on" on:click={goHome}>Go Home</p>
</div>

<style>
  .on {
    cursor: pointer;
  }
</style>