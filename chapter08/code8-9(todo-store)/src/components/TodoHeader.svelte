<script>
  import { todoForm, todos } from '../store'

  const handleTodoAdd = (e) => {
    if(e.keyCode === 13) {
      console.log(`todoForm: ${$todoForm}`)
      todos.addTodo($todoForm)
      todoForm.resetForm()
    }
  }

</script>

<header>
  <div class="wrap">
    <h1>SVELTE TODO </h1>    
    <input 
      type="text" 
      bind:value={$todoForm} 
      on:keyup={handleTodoAdd}
      />  
  </div>
</header>