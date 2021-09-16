<script>
  import { authToken } from '../stores';
  import { extractErrors, loginValidate } from '../utils/validates';

  let errors = {};

  let values = {
    formEmail: '',
    formPassword: ''
  }

  const resetValues = () => {
    values.formEmail = '';
    values.formPassword = '';
  }

  // const onLogin = async () => {
  //   try {
  //     await authToken.login(values.formEmail, values.formPassword);
  //     resetValues;
  //   }
  //   catch(error) {
  //     console.log(error);
  //   }    
  // }

  const onLogin = async () => {

    try {
      await loginValidate.validate(values, {abortEarly: false})
      await authToken.login(values.formEmail, values.formPassword);
      resetValues;
      
    }
    catch(error) {
      errors = extractErrors(error)

      if(errors.formEmail) {
        alert(errors.formEmail);
        return;
      }

      if(errors.formPassword) {
        alert(errors.formPassword);
        return;
      }
    }
  }  

</script>

<!-- start main login box-->
<main class=" mdl-layout__content">      
  <div class="box mdl-grid mdl-grid--no-spacing mdl-shadow--2dp">
  
    <div class="mdl-card mdl-cell mdl-cell--12-col">
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input" type="text" placeholder="이메일" bind:value={values.formEmail} class:wrong={errors.formEmail}>
      </div>
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input" type="text" placeholder="패스워드" bind:value={values.formPassword} class:wrong={errors.formPassword}>
      </div>          
      <div class="mdl-card__actions btn-box">
        <a href="#null" class="mdl-button mdl-js-button mdl-js-ripple-effect" on:click={onLogin} >로그인</a>
      </div>          
    </div>

  </div>
</main><!-- end main login box-->

<style>
.wrong {
  border-bottom: 3px solid red;
}
</style>