<script>
  import { auth } from '../stores';
  import { registerValidate, extractErrors } from '../utils/validates';

  let errors = {};


  let values = {
    formEmail: '',
    formPassword: '',
    formPasswordConfirm: '',
  }

  const onRegister = async () => {
    
    try {
      await registerValidate.validate(values, {abortEarly: false});
      await auth.register(values.formEmail, values.formPassword);
    }
    catch(error) {
      errors = extractErrors(error);

      if(errors.formEmail) {
        alert(errors.formEmail);
        return;
      }

      if(errors.formPassword) {
        alert(errors.formPassword);
        return;
      }

      if(errors.formPasswordConfirm) {
        alert(errors.formPasswordConfirm);
        return;
      }
    }
  }
</script>

<!-- start main register box-->
<main class="mdl-layout__content">      
  <div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
  
    <div class="mdl-card mdl-cell mdl-cell--12-col">
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input" type="text" placeholder="이메일" bind:value={values.formEmail} class:wrong={errors.formEmail}  >
      </div>
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input" type="text" placeholder="비밀번호" bind:value={values.formPassword} class:wrong={errors.formPassword} >
      </div>
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input" type="text" placeholder="비밀번호 확인" bind:value={values.formPasswordConfirm} class:wrong={errors.formPasswordConfirm} >
      </div>          
      <div class="mdl-card__actions btn-box">
        <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onRegister} >회원가입</a>
      </div>          
    </div>
  
  </div>
</main><!-- end main register box-->

<style>
.wrong {
  border-bottom: 3px solid red;
}
</style>