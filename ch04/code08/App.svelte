<script>
  let textValue = ''
  
  function clearText() {
    textValue = ''
  }
  
</script>

<input type="text" bind:value="{textValue}" />
<p> 입력값: {textValue} </p>
<button on:click={clearText}>지우기</button>
