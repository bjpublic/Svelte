<script>
  import { onMount } from 'svelte';
  import { articles, currentArticlesPage, loadingArticle, articlePageLock } from '../stores';
  import Article from './Article.svelte';

  let component;
  let elementScroll;

  onMount(() => {
    articles.resetArticles();
    articles.fetchArticles();
  });

  $: {
    if(component || elementScroll) {
      const element = elementScroll ? elementScroll : component.parentNode;
      element.addEventListener('scroll', onScroll);
      element.addEventListener('resize', onScroll);
    }
  }

  const onScroll = (e) => {
    const scrollHeight = e.target.scrollHeight;
    const clientHeight = e.target.clientHeight;
    const scrollTop = e.target.scrollTop;
    const realHeight = scrollHeight - clientHeight;
    const triggerHeight = realHeight * 0.7;

    const triggerComputed = () => {
      return scrollTop > triggerHeight;
    }

    const countCheck = () => {
      const check = $articles.totalPage <= $currentArticlesPage;
      return check;
    }

    if(countCheck()) {  
      articlePageLock.set(true);
    }    

    const scrollTrigger = () => {
      return triggerComputed() && !$articlePageLock;
    }    

    if(scrollTrigger()) {
      currentArticlesPage.increPage();
    }
  }

</script>

<!-- satart article-wrap -->
<div class="articles-wrap" bind:this={component}>
  {#each $articles.articleList as article, index}
    <Article {article} />
  {/each}

  {#if $loadingArticle}
    <div class="box mdl-grid mdl-grid--no-spacing ">
      <p>Loading...</p>
    </div>
  {/if}  
</div><!-- end article-wrap -->    