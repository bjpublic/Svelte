<script>
import { todos, countTodo } from '../store'
import Constant from '../constant'

const handleFetchTodoALL = () => todos.changeTodoView(Constant.ALL)
const handleFetchTodoActive = () => todos.changeTodoView(Constant.ACTIVE)
const handleFetchTodoDone = () => todos.changeTodoView(Constant.DONE)

</script>

<div class="info">
  <span>COUNT: {$countTodo}</span>
  <div>
    <button class:selected={$todos.viewMode === Constant.ALL} class="btn" on:click={handleFetchTodoALL} >ALL</button>
    <button class:selected={$todos.viewMode === Constant.ACTIVE} class="btn" on:click={handleFetchTodoActive} >ACTIVE</button>
    <button class:selected={$todos.viewMode === Constant.DONE} class="btn" on:click={handleFetchTodoDone} >DONE</button>
  </div>  
</div>
