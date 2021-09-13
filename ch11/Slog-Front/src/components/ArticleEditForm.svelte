<script>
  import { articles } from '../stores';

  export let article;

  const onCloseEditModeArticle = () => {
    articles.closeEditModeArticle();
  }

  const onUpdateArticle = () => {
    articles.updateArticle(article);
  }
</script>

<!-- start edit article box -->
<div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
  <div class="mdl-card mdl-cell mdl-cell--12-col">
    <div class="mdl-card__supporting-text">
      <div class="info-box">
        <div class="info">
          <p class="user-id">{article.userName}</p>
          <p class="post-day">{article.createdAt}</p>                  
        </div>
      </div>
    </div>            
    <div class="mdl-card__supporting-text">
  
      <div class="mdl-textfield">
        <textarea class="mdl-textfield__input" type="text" rows= "5" id="sample5" bind:value={article.content}  ></textarea>
      </div>
  
    </div>
    <div class="mdl-card__actions mdl-card--border btn-box">
      <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onUpdateArticle} >수정</a>
      <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onCloseEditModeArticle} >취소</a>
    </div>
  </div>

  <i class="bx bx-x material-icons cancel"></i>
</div> <!-- end edit article box -->