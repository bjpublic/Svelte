<script>
  import { articles, auth, authToken } from '../stores';
  import ArticleEditForm from './ArticleEditForm.svelte';
  import { router } from 'tinro';
  import dateView from '../utils/date.js';  

  export let article;

  let isViewMenu = false;

  $: {
    if($articles.menuPopup === article._id) {
      isViewMenu = true;
    }
    else {
      isViewMenu = false;
    }
  }  

  const onToggleMenuPopup = (_id) => {
    if(isViewMenu === true) {
      articles.closeMenuPopup(); 
      return;
    }
    articles.openMenuPopup(_id);    
  }  

  const onEditModeArticle = (_id) => {
    articles.openEditModeArticle(_id);
  }

  const onDeleteArticle = (_id) => {
    if(confirm('삭제 하시겠습니까?')) {
      articles.deleteArticle(_id);
    }
    else {
      return;
    }
  }  

  const goComments = (_id) => {
    router.goto(`/articles/comments/${_id}`);
  }

  const onLike = (_id) => {
    if($authToken) {
      articles.likeArticle(_id);
    }
  }

  const onCancelLike = (_id) => {
    if($authToken) {
      articles.cancelLikeArticle(_id);
    }
  }
</script>

{#if $articles.editMode === article._id}
  <ArticleEditForm {article} />
{:else}

  <!-- start article box-->
  <div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
    <div class="mdl-card mdl-cell mdl-cell--12-col">
      <div class="mdl-card__supporting-text ">
        <div class="info-box">
          <div class="info">
            <p class="user-id">{article.userName}</p>
            <p class="post-day">{dateView(article.createdAt)}</p>                  
          </div>
        </div>
      </div>            
      <div class="mdl-card__supporting-text ">
        <p class="pre">
          {article.content}
        </p> 
      </div>
      <div class="mdl-card__actions mdl-card--border">
        <!-- <a href="#null" class="mdl-button">Read our features</a> -->
        <div class="icon-box">          
          {#if article.likeMe}
            <i class="bx bxs-heart" on:click={() => {onCancelLike(article._id)}} ></i>
          {:else}
            <i class='bx bx-heart' on:click={() => {onLike(article._id)}} ></i>
          {/if}
          <p>{article.likeCount}</p>
        </div>       
        <div class="icon-box-comment">
          <p>{article.commentCount}</p>
          <i class="bx bx-comment" on:click={() => goComments(article._id)} ></i>
        </div>

      </div>
    </div>
    {#if article.userId === $auth._id}
      <button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon" on:click={()=> onToggleMenuPopup(article._id)}>
        <i class='bx bx-dots-vertical-rounded material-icons'></i>
      </button>
      <ul class="list-menu" class:is-show={isViewMenu}>
        <li class="onCursur" on:click={() => onEditModeArticle(article._id)}>Edit</li>
        <li class="onCursur" on:click={() => onDeleteArticle(article._id)}>Delete</li>
      </ul>
    {/if}
  </div><!-- end article box-->

{/if}