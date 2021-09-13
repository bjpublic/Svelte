<script>
  let boxChecked = false
</script>

<label>
  체크 박스 예제
  <input type="checkbox" bind:checked="{boxChecked}">
</label>

<button disabled={!boxChecked} >전송</button>
