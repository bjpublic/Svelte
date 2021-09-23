<script>
  import { articles } from '../stores';
  import { contentValidate, extractErrors } from '../utils/validates';  
  
  let errors={};

  let values = {
    formContent: ''
  }

  const onAddArticle = async () => {
    try {
      await contentValidate.validate(values, {abortEarly: false});
      await articles.addArticle(values.formContent);
      onCancelAddArticle();
      alert('새 글이 입력되었습니다.');
    }
    catch(error) {
      errors = extractErrors(error);
      if(errors.formContent) {
        alert(errors.formContent);
        return;
      }
    }
  }

  const onCancelAddArticle = () => {
    values.formContent = '';
  }

</script>

<!-- start article-add-form box -->
<div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
  <div class="mdl-card mdl-cell mdl-cell--12-col comment-box">
    <div class="mdl-card__supporting-text ">
      <div class="info-box">
        <p>지금 여러분의 생각을 적어주세요.</p>
      </div>

    </div>              
    <div class="mdl-card__supporting-text">
    
      <div class="mdl-textfield">
        <textarea class="mdl-textfield__input" type="text" rows= "5" id="sample5" placeholder="내용을 입력해 주세요." bind:value={values.formContent} ></textarea>
      </div>
    
    </div>
    <div class="mdl-card__actions mdl-card--border btn-box">
      <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onAddArticle} >입력</a>
      <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onCancelAddArticle}>취소</a>
    </div>
  </div>
</div><!-- end article-add-form box -->