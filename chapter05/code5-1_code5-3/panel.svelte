<script>
  import Button from './button.svelte';
  export let count;
</script>

<div class="penal">
  <h1>{count}</h1>
  <Button />
</div>

<style>
  .penal {
    padding: 20px;
    display:flex;
    flex-direction: column;
    justify-items: center;
    justify-content: space-around;
    align-items: center;
    height: 100px;
    width:200px;
    background: #e2e2e2;
    border: 1px solid #777777;
  }
</style>
