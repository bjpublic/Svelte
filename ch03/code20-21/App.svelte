<script>
  function handleClick_1(param) {
    alert(`선택값 ${param}`)
  }
  
  function handleClick_2(param) {
    alert(`선택값 ${param}`)
  } 
</script>

<button on:click={() => handleClick_1('1번')}>1번 버튼</button>
<button on:click={() => handleClick_2('2번')}>2번 버튼</button>

<!-- <button on:click={handleClick_1('1번')}>1번 버튼</button>
<button on:click={handleClick_1('2번')}>2번 버튼</button> -->
