<script>
  import writer from "./writer.js";
  let setSpeed = 100;
</script>

<h1 use:writer={setSpeed}>타이핑하는 효과입니다.</h1>

<button on:click={() => setSpeed = 100} >속도 100</button>
<button on:click={() => setSpeed = 1000}>속도 1000</button>
