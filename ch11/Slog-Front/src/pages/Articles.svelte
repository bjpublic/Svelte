<script>
  import ArticleHeader from '../components/ArticleHeader.svelte';
  import ArticleList from '../components/ArticleList.svelte';
  import ArticleAddForm from '../components/ArticleAddForm.svelte';
  import { authToken } from '../stores';
  import Comments from '../pages/Comments.svelte'
  import { Route } from 'tinro';
</script>

<!-- start svelte-demo -->
<div class="svelte-demo mdl-color--grey-100 mdl-layout mdl-js-layout mdl-layout--fixed-header">
  <ArticleHeader />
  <!-- start main-->
  <main class="mdl-layout__content">
    {#if $authToken}
      <ArticleAddForm />
    {/if}
    <ArticleList />
  </main><!-- end main-->

  <Route path="/comments/:_id">
    <Comments />
  </Route>    
</div><!-- end svelte-demo -->
