<script>
import { todos } from '../store';

export let todo;

const handleCheckTodo = () => todos.checkTodo(todo.id);
const handleChangeTodoEditMode = () => todos.changeTodoEditMode(todo.id);
const handleEditTodo = () => {
  todos.editTodo(todo);
  todos.closeTodoEditMode();
}
const handleRemoveTodo = () => todos.removeTodo(todo.id);

</script>

<input type="checkbox" bind:checked={todo.done} on:click={handleCheckTodo} />
{#if $todos.editMode === todo.id }
  <input type="text" bind:value={todo.content} on:focusout={handleEditTodo} >
{:else}
  <span on:dblclick={handleChangeTodoEditMode}>{todo.content}</span>
{/if}
<a href="#null" on:click={handleRemoveTodo} >X</a>


