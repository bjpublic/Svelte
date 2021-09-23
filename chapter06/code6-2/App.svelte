<script>
  let current = 'one';
</script>

<button
  class:active="{current === 'one'}"
  on:click="{() => current = 'one'}"
>첫번째</button>

<button
  class:active="{current === 'two'}"
  on:click="{() => current = 'two'}"
>두번째</button>

<button
  class:active="{current === 'three'}"
  on:click="{() => current = 'three'}"
>새번째</button>

<style>
  button {
    display: block;
  }

  .active {
    background-color: #ff3e00;
    color: white;
  }
</style>
