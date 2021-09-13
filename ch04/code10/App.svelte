<script>
  let todos = [
    {
      id: 1,
      content: '1번 항목'
    },
    {
      id: 2,
      content: '2번 항목'
    },
    {
      id: 3,
      content: '3번 항목'
    },    
  ]

  let selected = '';
</script>

<select bind:value={selected} >
  {#each todos as todo}
    <option value={todo.id}>{todo.content}</option>
  {/each}
</select>

<p>{selected} 선택됨</p>
