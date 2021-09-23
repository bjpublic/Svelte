<script>

  import Constant from '../constant';

  export let todoCount;
  export let viewMode;
  export let handleChangeViewMode;
</script>

<div class="info">  
  <span>COUNT: {todoCount}</span>
  <div>
    <button class="btn" class:selected={viewMode === Constant.ALL} on:click={() => handleChangeViewMode(Constant.ALL)} >ALL</button>
    <button class="btn" class:selected={viewMode === Constant.ACTIVE} on:click={() => handleChangeViewMode(Constant.ACTIVE)}>ACTIVE</button>
    <button class="btn" class:selected={viewMode === Constant.DONE} on:click={() => handleChangeViewMode(Constant.DONE)}>DONE</button>
  </div> 
</div>
 