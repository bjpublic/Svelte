<script>
  import { tick } from "svelte";
  let a = 1;
  let b = 2;
  let sumElement;

  async function handleUpdate() {
    a = 2;
    b = 5;

    // tick을 이용해 변경된 상태값이 돔에 적용되기를 기다림
		await tick();

    // Logs 2 + 5 = 7
		console.log(`${a}, ${b}`);
    console.log(sumElement.textContent);
  }
</script>

<div class="sum" bind:this={sumElement}>
  {a} + {b} = {a + b}
</div>
<button on:click={handleUpdate}>
  숫자 업데이트
</button>