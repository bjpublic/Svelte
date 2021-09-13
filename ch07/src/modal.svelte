<script>
    import { fade, fly } from 'svelte/transition'; 
  export let modalActive = false
  
  function close() {
    modalActive = false
  }
</script>

{#if modalActive}
  <!-- <div class="modal-background" on:click={close} ></div> -->
    <div 
    class:modal-background={modalActive === true} 
    in:fade="{{delay: 0, duration: 300}}" 
    out:fade="{{delay: 300, duration: 300}}" on:click={close} > <!-- 하면전환 효과 추가 -->
  </div>


  <!-- <div class="modal" role="dialog" aria-modal="true" > -->
  <div 
    class="modal" 
    role="dialog" 
    aria-modal="true" 
    transition:fly="{{delay:200 , duration: 300, x: 0, y: -50, opacity: 0.5}}" >  
    <slot name="header"></slot>
    <hr>
    <slot name="content"></slot>
    <hr>

    <!-- svelte-ignore a11y-autofocus -->
    <button autofocus on:click={close}>close modal</button>
  </div>
{/if}

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
  }

  .modal {
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: 32em;
    max-height: calc(100vh - 4em);
    overflow: auto;
    transform: translate(-50%,-50%);
    padding: 1em;
    border-radius: 0.2em;
    background: white;
  }

  button {
    display: block;
  }
  
</style>
