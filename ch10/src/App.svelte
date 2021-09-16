<script>
import axios from 'axios'

let page = 1
let limit = 10

// $: items = fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`).then(response => response.json())
$: items = axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`).then(response => response.data);

function nextPage() {
  page = page + 1
}

</script>

<header>
  <div class="wrap">
    <h1 class="main-title">REST API PAGE</h1>
  </div>
</header>
<div class="info">
  <div class="wrap">
    <span>PAGE: {page}</span>
  </div>
</div>
<div class="main" id="main" >
  {#await items}
    <p>...Loading</p>
  {:then items } 
    <ul>
      {#each items as item, index}
        <li>
          <p>[{item.id}] {item.title}</p>
        </li>
      {/each}
    </ul>    
  {:catch error}
    <p>오류가 발생했습니다.</p>
  {/await}
  
  <a href="#null" class="btn-blue" on:click={nextPage} >NEXT PAGE</a>

</div>