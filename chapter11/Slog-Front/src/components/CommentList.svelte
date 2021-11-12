<script>
  import { onMount } from 'svelte';
  import { router, meta } from 'tinro';
  import Comment from '../components/Comment.svelte';
  import { articleContent, comments, authToken } from '../stores';
  import { extractErrors, contentValidate } from '../utils/validates';  
  import dateView from '../utils/date.js';  

  let errors={};

  const route = meta();  
  const articleId = route.params._id;

  let values = {
    formContent: ''
  }

  onMount(() => {
    articleContent.getArticle(articleId);
    comments.fetchComments(articleId);
  });

  const goArticle = () => router.goto('/articles');

  const onAddComment = async () => {
    try {
      await contentValidate.validate(values, {abortEarly: false});
      await comments.addComment(articleId, values.formContent);
      values.formContent = '';
    }
    catch(error) {
      errors = extractErrors(error);
      if(errors.formContent) {
        alert(errors.formContent);
        return;
      }
    }
  }

</script>


<!-- start comment-modal-bg-->
<div class="comment-modal-bg modal-show">
  <div class="mdl-layout__content comment-wrap">
    <!--  start box-comment-article -->
    <div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
      <div class="mdl-card mdl-cell mdl-cell--12-col comment-box">
        <div class="mdl-card__supporting-text ">
          <div class="info-box">
            <div class="info">
              <p class="user-id">{$articleContent.userName}</p>
              <p class="post-day">{dateView($articleContent.createdAt)}</p>                         
            </div>
          </div>
        </div>            
        <div class="mdl-card__supporting-text bottom-padding ">
          <p class="pre">{$articleContent.content}</p>
        </div>
        <div class="mdl-card__supporting-text flex-right ">
          <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={goArticle} >글 목록 보기</a>
        </div>
        <div class="mdl-card__supporting-text ">
          <h5>Comments</h5>
        </div>

        <!-- start comment list-->
        <ul class="mdl-list">
         {#each $comments as comment, index }
            <Comment {comment} {articleId} />
          {/each}                                                                                                                                
        </ul> <!-- end comment list-->            
        {#if $authToken}
        <div class="mdl-card__actions">
          <div class="mdl-textfield">
            <textarea class="mdl-textfield__input" type="text" rows= "5" bind:value={values.formContent} ></textarea>
          </div>
        </div>
        <div class="btn-box">
          <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onAddComment}>입력</a>
        </div>
        {/if}
      </div>
    </div><!--end box-comment-article-->
  </div><!-- end mdl-layout__content-->
</div><!-- end comment-modal-bg-->