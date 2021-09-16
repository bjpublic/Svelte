<script>
  import draggable from './draggable';
  let positions1 = {
    x: 100,
    y: 200
  }
  
  let positions2 = {
    x: 300,
    y: 300
  } 
</script>

<div use:draggable={positions1} class="draggable">
  <b>박스1</b>
</div>

<div use:draggable={positions2} class="draggable">
  <b>박스2</b>
</div>

<style>
  .draggable {
    position: absolute;
    border: solid 1px gray;
    padding: 20px;
    cursor: move;
  }
</style>
