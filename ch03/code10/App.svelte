<script>
let list = [
  {
    id:0,
    content: '첫 번째 할일',
    done: false
  },
  {
    id:1,
    content: '두 번째 할일',
    done: false
  },
  {
    id:2,
    content: '세 번째 할일',
    done: true
  },
  {
    id:3,
    content: '네 번째 할일',
    done: false
  } 
]
</script>

<ul>
  {#each list as item}
    <li>
      <p>{item.id}</p>
      <p>{item.content}</p>
      <p>{item.done}</p>
    </li>
  {/each}
</ul>
