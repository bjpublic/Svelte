<script>
  let selected = 0
</script>

<h2>Size</h2>

<label>
  <input type=radio bind:group={selected} value={1}>
  One scoop
</label>

<label>
  <input type=radio bind:group={selected} value={2}>
  Two scoops
</label>

<label>
  <input type=radio bind:group={selected} value={3}>
  Three scoops
</label>

<p>선택된 라디오 버튼: {selected} 번째</p>
