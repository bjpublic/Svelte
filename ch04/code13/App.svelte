<script>
  let numbers = [
    'own',
    'two',
    'three'
  ]
  
  let getNumbers = []
</script>

{#each numbers as number}
  <label>
    <input type="checkbox" bind:group={getNumbers} value={number} /> 
    {number}
  </label>
{/each}

{getNumbers}
