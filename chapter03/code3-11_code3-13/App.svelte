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

const handleAddTodo = () => {
  const todo = {
    id: list.length + 1,
    content: '새로운 할일',
    done: false
  }
  
  // list.push(todo);
  
  // list = list; // list 재할당
  list = [...list, todo]
}

</script>

<ul>
  {#each list as item}
    <li>
      <p>{item.content}</p>
    </li>
  {/each}
</ul>

<button on:click={handleAddTodo}>할일 추가</button>
