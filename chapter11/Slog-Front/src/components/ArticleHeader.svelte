<script>
  import { router } from 'tinro';
  import { authToken, articlesMode } from '../stores';
  import { NOMAL_FETCH, LIKE_FETCH, MY_FETCH } from '../utils/constant'
  
  const goLogin = () => router.goto('/login');
  const onLogout = () => authToken.logout();

  const onViewModeChange = (mode) => {
    router.goto('/articles');
    articlesMode.changeMode(mode);
  }  
  
</script>

<!-- start header -->
<header class="mdl-layout__header mdl-layout__header--waterfall">
  <div class="mdl-layout__header-row">
      <!-- Title -->
      <span class="mdl-layout-title">SLogs </span>
      <nav class="mdl-navigation">
        <a class="mdl-navigation__link"  class:selected={$articlesMode === NOMAL_FETCH} href="#null" on:click={() => onViewModeChange(NOMAL_FETCH)} >모두 보기</a>
        
        {#if $authToken}
          <a class="mdl-navigation__link" href="#null" class:selected={$articlesMode === LIKE_FETCH} on:click={() => onViewModeChange(LIKE_FETCH)}>좋아요 보기</a>
          <a class="mdl-navigation__link" href="#null" class:selected={$articlesMode === MY_FETCH} on:click={() => onViewModeChange(MY_FETCH)}>내글 보기</a>
        {:else}
          <a class="mdl-navigation__link blocked" href="#null" >좋아요 보기</a>
          <a class="mdl-navigation__link blocked" href="#null" >내글 보기</a>
        {/if}
      </nav>

      {#if $authToken}
        <i class="bx bx-log-out" on:click={onLogout} ></i>
      {:else} 
        <i class="bx bx-log-in" on:click={goLogin} ></i>
      {/if}      
  </div>
</header><!-- end header -->