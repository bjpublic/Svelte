<script>
  let html = '<p>내용을 입력해주세요...</p>';
</script>

<div contenteditable="true" bind:innerHTML={html}></div>

<pre>{html}</pre>
