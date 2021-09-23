<script>
  import { router, meta } from 'tinro';

  const route = meta();
  const url = route.url;

  const goHome = () => {
    router.goto('/');
  } 

</script>

<!-- start header -->
<header class="mdl-layout__header mdl-layout__header--waterfall">
  <div class="mdl-layout__header-row">
      <span class="mdl-layout-title">SLogs</span>
      <nav class="mdl-navigation">
        <a class="mdl-navigation__link" class:selected={url==='/login'} href="/login"  >로그인</a>
        <a class="mdl-navigation__link" class:selected={url==='/register'} href="/register" >회원가입</a>
      </nav>
      <i class="bx bxs-home" on:click={goHome} ></i>
  </div>
</header><!-- end header -->