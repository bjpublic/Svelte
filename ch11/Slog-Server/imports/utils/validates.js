import * as yup from 'yup';

export const extractErrors = error => {
  return error.inner.reduce((acc, error) => {
    return {...acc, [error.path]: error.message}
  }, {});
}

export const insertArticleValidate = yup.object().shape({
  userId: yup.string().required('로그인을 확인해 주세요'),
  content: yup.string().required('내용이 입력되지 않았습니다.'),
});

export const updateArticleSValidate= yup.object().shape({
  articleId: yup.string().required('식별코드가 전달되지 않았습니다.'),  
  content: yup.string().required('내용이 입력되지 않았습니다.'),
});

// export const removeArticleValidate = yup.object().shape({
//   articleId: yup.string().required('식별코드가 전달되지 않았습니다.'),  
// });

export const insertCommentValidate = yup.object().shape({
  userId: yup.string().required('로그인을 확인해 주세요'),
  comment: yup.string().required('내용이 입력되지 않았습니다.'),
});

// export const removeCommentValidate = yup.object().shape({
//   commentId: yup.string().required('식별코드가 전달되지 않았습니다.')  
// });

export const loginValidate = yup.object().shape({
  email: yup.string().required('이메일을 입력해 주세요.'), 
  password: yup.string().required('패스워드를 입력해주세요.'),  
});

export const registerValidate  = yup.object().shape({
  email: yup.string().required('이메일을 입력해 주세요.'), 
  password: yup.string().required('패스워드를 입력해주세요.'),  
  passwordConfirm: yup.string().required('패스워드확인을 입력해주세요.'),  
});