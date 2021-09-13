<script>
  import { comments, auth } from '../stores';
  import dateView from '../utils/date.js';

  export let comment;
  export let articleId;

  const onDeleteComment = () => {
    if(confirm('삭제 하시겠습니까?')) {
      comments.deleteComment(comment._id, articleId);
    }
    else {
      return;
    }
  }  
</script>

<!-- start li -->
<li class="mdl-list__item mdl-list__item--three-line">
  <span class="mdl-list__item-primary-content">
    <div class="info-box">
      <div class="info">
        <p class="user-id">{comment.userName}</p>
        <p class="post-day">{dateView(comment.createdAt)}</p>
      </div>
      {#if comment.userId === $auth._id}
        <i class="bx bx-trash delete" on:click={onDeleteComment}></i>
      {/if}
    </div>
    
    <div class="comment-content">
      <p class="pre">{comment.content}</p>                                              
    </div>
  </span>
</li><!-- end li -->       