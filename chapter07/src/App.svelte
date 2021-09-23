<script>
  import Modal from './modal.svelte'
  let modalActive1 = false;
  let modalActive2 = false;
</script>

<!--  추가 -->
<button on:click={() => modalActive1 = true}>
  Modal PopUp 1
</button>

<button on:click={() => modalActive2 = true}>
  Modal PopUp 2
</button>

<div>
  <p>modalActive1: {modalActive1}</p>
  <p>modalActive2: {modalActive2}</p>
</div>

<Modal  bind:modalActive={modalActive1}>
  <h2 slot="header">
    MODAL POPUP TITLE 1
  </h2>
  <p slot="content">
    MODAL POPUP <b> CONTENT 1 </b>
  </p>
</Modal>

<Modal  bind:modalActive={modalActive2}>
  <h2 slot="header">
    MODAL POPUP TITLE 2
  </h2>
  <p slot="content">
    MODAL POPUP CONTENT 2
  </p>
</Modal>
