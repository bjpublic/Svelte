import { writable, get } from "svelte/store";
import {getApi, putApi, delApi, postApi} from './service/api';
import { router } from 'tinro';
import { NOMAL_FETCH, LIKE_FETCH, MY_FETCH } from './utils/constant';

function setArticleMode() {
  const {subscribe, update, set} = writable(NOMAL_FETCH); 

  const changeMode = (mode) => {
    set(mode);
    articles.resetArticles();
    articles.fetchArticles();
  }

  return {
    subscribe,
    changeMode,
  }  
}

function setCurrentArticlesPage() {

  const {subscribe, update, set} = writable(1);

  // const resetPage = () => set(1);
  const resetPage = () => set(1);
  const increPage = () => {
    update(data => data = data + 1);
    articles.fetchArticles();
  }

  return {
    subscribe,
    resetPage,
    increPage,
  }
}

function setArticles() {

  let initValues = {
    articleList: [],
    totalPage: 0,
    menuPopup:'',
    editMode:''
  }

  let values = {...initValues};
  
  const { subscribe, update, set } = writable(values);

  const fetchArticles = async () => {

    const currentPage = get(currentArticlesPage);

    try {
      
      loadingArticle.turnOnLoading();

      // let path = `/articles/${currentPage}`;
      let path = '';
      const mode = get(articlesMode);

      if(mode === NOMAL_FETCH) {
        path = `/articles/${currentPage}`;
      }
      else if(mode === LIKE_FETCH) {
        path = `/likes/${currentPage}`;
      }
      else if(mode === MY_FETCH) {
        path = `/articles/my/${currentPage}`;
      }
      else {
        path = `/articles/${currentPage}`;
      }
      
      const options = {
        path: path,
      }

      const getDatas = await getApi(options);
      
      const newData = {
        articleList: getDatas.articles,
        totalPage: getDatas.totalPage,
      }

      update(datas => {
        
        const newArticles = [...datas.articleList, ...newData.articleList];
        
        if(currentPage === 1) {
          datas.articleList = newData.articleList;
          datas.totalPage = newData.totalPage;
        }
        
        datas.articleList = newArticles;
        datas.totalPage = newData.totalPage;
        
        loadingArticle.turnOffLoading();

        return datas;
      })
    }
    catch(error) {
      loadingArticle.turnOffLoading();
      throw error;
    }
  }

  const resetArticles = () => {

    let resetValue = {...initValues}

    set(resetValue);
    currentArticlesPage.resetPage(); 
    articlePageLock.set(false);
  }

  const addArticle = async (content) => {

    try {

      const options =  {
        path:"/article",
        data: {
          content: content,
        }
      }

      const newArticle = await postApi(options);

      update(datas => {
        datas.articleList = [newArticle, ...datas.articleList];
        return datas;
      });

      return;
    }
    catch(error) {
      throw error;
    }
  }  

  const openMenuPopup = (_id) => {
    update(datas => {
      datas.menuPopup = _id;
      return datas;
    })
  }

  const closeMenuPopup = () => {
    update(datas => {
      datas.menuPopup = '';
      return datas;
    })
  }

  const openEditModeArticle = (_id) => {
    articles.closeMenuPopup();

    update(datas => {
      datas.editMode = _id;
      return datas;
    });
  }

  const closeEditModeArticle = () => {
    update(datas => {
      datas.editMode = '';
      return datas;
    });
  }  

  const updateArticle = async (article) => {
    try {

      const updateData = {
        _id: article._id,
        content: article.content,
      }

      const options = {
        path: '/article',
        data: updateData
      }

      const updatedArticle = await putApi(options);

      update(datas => {
        const setDatas = datas.articleList.map(article => {
          if(article._id === updatedArticle._id) {
            article = updatedArticle;
          }
          return article
        });

        datas.articleList = setDatas;
        return datas;
      });

      articles.closeEditModeArticle();
      alert('수정 완료');
    }
    catch(error) {
      alert('수정 중에 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }  

  const deleteArticle = async (_id) => {

    try {

      const options = {
        path: '/article/' + _id,
      }

      await delApi(options);

      update(datas => {
        const setDatas = datas.articleList.filter(article => article._id !== _id);
        datas.articleList = setDatas;
        return datas;
      });
    }
    catch(error) {
      alert('삭제 중 오류가 발생했습니다. ');
    }
  }

  const increArticleCommentCount =(articleId) => {
    update(datas => {
      const newArticle = datas.articleList.map(article => {
        if(article._id === articleId) {
          article.commentCount = article.commentCount +1;
        }
        return article;
      })
      datas.articleList = newArticle;
      return datas;
    })
  }

  const decreArticleCommentCount = (articleId) => {
    update(datas => {
      const newArticles = datas.articleList.map(article => {
        if(article._id === articleId) {
          article.commentCount = article.commentCount -1;
        }
        return article;
        
      });
      datas.articleList = newArticles;
      return datas;
      
    });
  }  

  const likeArticle = async (articleId) => {

    try {

      const options = {
        path: '/like',
        data: {
          articleId: articleId,
        }
      }

      await putApi(options);
      update(datas => {
        const newArticles = datas.articleList.map(article => {
          if(article._id === articleId) {
            article.likeCount = article.likeCount + 1;
            article.likeMe = true;
          } 
          return article;  
        });
        datas.articleList = newArticles;
        return datas;
      });      
      
    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  const cancelLikeArticle = async (articleId) => {

    try {

      const options = {
        path: '/cancellike',
        data: {
          articleId: articleId,
        }
      }

      await putApi(options);

      update(datas => {
        const newArticles = datas.articleList.map(article => {
          if(article._id === articleId) {
            article.likeCount = article.likeCount - 1;
            article.likeMe = false;
          } 
          return article;  
        });
        datas.articleList = newArticles;
        return datas;
      });

    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }  

  return {
    subscribe,
    fetchArticles,
    resetArticles,
    addArticle,
    openMenuPopup,
    closeMenuPopup,
    openEditModeArticle,
    closeEditModeArticle,
    updateArticle,
    deleteArticle,
    increArticleCommentCount,
    decreArticleCommentCount,
    likeArticle,
    cancelLikeArticle,
  }
}

function setLoadingArticle() {
  const {subscribe, set} = writable(false);

  const turnOnLoading = () => {
    set(true);
    articlePageLock.set(true);
  } 
  const turnOffLoading = () => {
    set(false);
    articlePageLock.set(false);
  }

  return {
    subscribe,
    turnOnLoading,
    turnOffLoading,
  }
}

function setArticleContent() {
  let initValues = {
    _id: '',
    userId: '',
    userName: '',
    content: '',
    createdAt: '',
    commentCount: 0,
    likeCount: 0,          
    likeUsers: [],   
  }

  let values = {...initValues}

  const { subscribe, set } = writable(values);

  const getArticle = async (_id) => {

    try {
      const options = {
        path: `/article/${_id}`
      }

      const getData = await getApi(options);
      set(getData);
    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.'); 
    }
  }

  return {
    subscribe,
    getArticle,
  }
}

function setComments() {

  const { subscribe, update, set } = writable([]);

  const fetchComments = async (_id) => {

    try {
      const options = {
        path: `/comments/${_id}`
      }

      const getDatas = await getApi(options);
      set(getDatas);

    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요. ')
    }
  }

  const addComment = async (articleId, commentContent) => {
      
    try {
        const options = {
          path: '/comment',
          data: {
            articleId: articleId,
            content: commentContent,
          },
        }

        const newData = await postApi(options);

        update(datas => [...datas, newData]);
        articles.increArticleCommentCount(articleId);

      }
      catch(error) {
        // alert('오류가 발생했습니다. 다시 시도해 주세요.')
        throw error;
      }
  }

  const deleteComment = async(_id, articleId) => {
    try {
      const options = {
        path: '/comment',
        data: {
          _id: _id,
          articleId: articleId,
        }
      }

      await delApi(options);

      update(datas => datas.filter(comment => comment._id !== _id));      
      articles.decreArticleCommentCount(articleId);

      alert('코멘트가 삭제되었습니다.');

    }
    catch(error) {
      throw error;
    }
  }

  return {
    subscribe,
    fetchComments,
    addComment,
    deleteComment,
  }  
}

function setAuth() {

  let initValues = {
    _id: '',
    email: '',
  }

  let values = {...initValues}

  const { subscribe, set, update } = writable(values);

  const isLogin = async () => {

    try {
      const getUserInfo = await getApi({path: '/user'});
      set(getUserInfo)
    }
    catch(error) { // 토큰이 비정상적일 때 리셋.
      auth.resetUserInfo();
      authToken.resetAuthToken();
    }    
  }

  const resetUserInfo = () => {
    const newValues =  {...initValues}
    set(newValues);
  }

  const register = async (email, password) => {
    try {
      const options = {
        path: '/users',
        data: {
          email: email,
          password: password,
        }
      }

      await postApi(options);
      alert('가입이 완료되었습니다.');
      router.goto('/login')
      
    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    }
  }

  return {
    subscribe,
    isLogin,
    resetUserInfo,
    register,
  }
}

function setAuthToken() {

  const token = localStorage.getItem('authToken');

  const { subscribe, set } = writable(token);

  const login = async (email, password) => {

    try {

      const options = {
        path: '/login',
        data: {
          email: email,
          password: password,
        }
      }
      
      const response = await postApi(options);
      const token = response.authToken;
      
      localStorage.setItem('authToken', token);
      set(token);
      router.goto('/articles');
    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.');
    }
  }

  const logout = async () => {
    try {
      const options = {
        path: '/logout' 
      }
      await postApi(options);
      authToken.resetAuthToken();
      articles.resetArticles();
      articles.fetchArticles();
    }
    catch(error) {
      alert('오류가 발생했습니다. 다시 시도해 주세요.')
    }   
  }

  const resetAuthToken = () => {
    set('');
    localStorage.removeItem('authToken');
  }

  return {
    subscribe,
    login, 
    logout,
    resetAuthToken,
  }
}

export const currentArticlesPage = setCurrentArticlesPage();
export const articles = setArticles();
export const loadingArticle = setLoadingArticle();
export const articlePageLock = writable(false);
export const articleContent = setArticleContent();
export const articlesMode = setArticleMode();
export const comments = setComments();
export const auth = setAuth();
export const authToken = setAuthToken();