<script>
  let todos = [
      {
        id:1,
        content: '첫 번째 할일',
        done: false
      },
      {
        id:2,
        content: '두 번째 할일',
        done: false
      },
      {
        id:3,
        content: '세 번째 할일',
        done: true
      },
      {
        id:4,
        content: '네 번째 할일',
        done: false
      }
  ]
</script>

<ul>
  <!-- {#each todos as todo}
    <li>
      <span>{todo.id}</span>
      <span>{todo.content}</span>
    </li>
  {/each} -->
  <!-- {#each todos as {id, content} }
    <li>
      <span>{id}</span>
      <span>{content}</span>
    </li>
  {/each} -->
  <!-- {#each todos as {id, content}, i }
    <li>
      <span>{i}</span>
      <span>{id}</span>
      <span>{content}</span>
    </li>
  {/each} -->
  {#each todos as todo (todo.id) }
    <li>
      <span>{todo.id}</span>
      <span>{todo.content}</span>
    </li>
  {/each}

</ul>
