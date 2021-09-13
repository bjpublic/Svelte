<script>
  import Card from './card.svelte';
</script>

<Card>
  <span slot="name">
    홍길동
  </span>

  <span slot="address">
    서울특별시<br>
    여의도동
  </span>
</Card>

<br/>

<!-- <Card>
  <span slot="name">
    홍길동
  </span>

  <span slot="address">
    서울특별시<br>
    여의도동
  </span>
  <span slot="email">
    myemail@google.com
  </span>
</Card> -->
<Card let:hovering>
  <span slot="name" >
    홍길동
  </span>

  <span slot="address">
    서울특별시 여의도동
  </span>
  <span slot="email">
    {#if hovering}
      <b>myemail@google.com</b> 
    {:else}
      myemail@google.com
    {/if}
  </span>
</Card>
