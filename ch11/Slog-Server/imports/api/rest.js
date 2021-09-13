import { Restivus } from 'meteor/maka:rest'; 
import articles from './Articles';
import comments from './Comments';
import likes from './Likes';
import { NOMAL_FETCH, LIKE_FETCH, MY_FETCH } from '../constant';
import { failMessage } from '../utils/messages';

if(Meteor.isServer) {
  
  const Api = new Restivus({
    prettyJson: true,
    useDefaultAuth: true,
    enableCors: true,
    defaultHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      "Access-Control-Allow-Credentials": true ,
      'Content-Type': 'application/json',
      'Access-Control-Max-Age': '86400',
    },
  });

  Api.addCollection(Meteor.users, {});

  Api.addRoute('user', {authRequired: true}, {
    get: {
      async action() {
        const token = this.request.headers['x-auth-token'];    
      
        const hashedToken = Accounts._hashLoginToken(this.request.headers['x-auth-token']);
        const user = await Meteor.users.rawCollection().findOne({
          'services.resume.loginTokens.hashedToken': hashedToken
        });
        
        const userInfo = {
          _id: user._id,
          email: user.emails[0].address,
        }
        
        return userInfo;  
      }
    }  
  });


  Api.addRoute('articles/:page',{authRequired: false}, {
    get: {
      // authRequired: false,
      async action() {

        console.log('get articles')
        const token = this.request.headers['x-auth-token'];
        
        let user = ''
        const page = this.urlParams.page; // parma 값이 없으면 그냥 에러 리턴 그래서 가드를 해줄 필요가 없음...
        
        if(token) {
          const hashedToken = Accounts._hashLoginToken(this.request.headers['x-auth-token']);
          user = await Meteor.users.rawCollection().findOne({
            'services.resume.loginTokens.hashedToken': hashedToken
          });          
        }

        let values = {
          user: user,
          page: page,
          mode: NOMAL_FETCH,
        }
        
        return articles.readArticle(values); 
      }
    },
  });

  Api.addRoute('articles/my/:page',{authRequired: true}, {
    get: {
      async action() {

        console.log('get articles')
        const token = this.request.headers['x-auth-token'];
        
        let user = ''
        const page = this.urlParams.page; // parma 값이 없으면 그냥 에러 리턴 그래서 가드를 해줄 필요가 없음...
        
        if(token) {
          const hashedToken = Accounts._hashLoginToken(this.request.headers['x-auth-token']);
          user = await Meteor.users.rawCollection().findOne({
            'services.resume.loginTokens.hashedToken': hashedToken
          });          
        }

        let values = {
          user: user,
          page: page,
          mode: MY_FETCH,
        }
        
        return articles.readArticle(values); 
      }
    },
  });


  Api.addRoute('article/:_id', {authRequired:false}, {
    get: {
      action() {
        console.log('get article')
        return articles.readOneArticle(this.urlParams._id);
      }
    },
    delete: {
      authRequired: true,
      async action() {
        console.log('delete article');
        // console.log(`this.request: ${this.res}`);
        values = {
          _id: this.urlParams._id,
          userId: this.userId
        }

        console.log(`userId: ${this.userId}, _id: ${this.urlParams._id}`);
  
        const result = await articles.removeArticle(values);
        return result;
      },  
    },
  });

  Api.addRoute('article', {authRequired: true}, {
    
    post: {
      action() {
        // console.log(`user: ${this.userId}`)
        console.log('post article')
        if(this.userId) {
          values = {
            userId: this.userId,
            content: this.bodyParams.content,
          }
          
          return articles.addArticle(values);
        }
        return {
          statusCode: 401,
          body: {status: 'fail', message: 'user not login'}
        }
      }
    },
    put() {
      console.log('article put')
      values = {
        _id: this.bodyParams._id,
        content: this.bodyParams.content,
        userId: this.userId
      }

      return articles.updateArticle(values);
    },
  });
  
  Api.addRoute('comments/:_id', {authRequired: false}, {
    get: {
      async action() {
        console.log('get comments')
        const articleId = this.urlParams._id;
        console.log(`articleId1: ${articleId}`);
        const result = await comments.readComments(articleId);
        return result;
      }
    },
  });


  Api.addRoute('comment', {authRequired: true}, {
    post: {
      async action() {
        console.log('add comment')
        const values = {
          userId: this.userId,
          articleId: this.bodyParams.articleId,
          content: this.bodyParams.content,
        }

        const result = await comments.addComment(values);
        return result;
      }
    },
    delete: {
      async action() {
        const values = {
          userId: this.userId,
          _id: this.bodyParams._id,
          articleId: this.bodyParams.articleId,
        }

        console.log(`userId: ${this.userId}, _id: ${this.bodyParams._id}, articleId: ${this.bodyParams.articleId}`)

        const result = await comments.removeComment(values);
        return result;        
      }
    }
  });


  Api.addRoute('likes/:page', {authRequired: true}, {
    get() {
      console.log('get likes');
      
      const userId = this.userId;
      const page = this.urlParams.page;

      const values = {
        userId: userId,
        page: page,
      }
      
      return likes.readLikes(values);
    }
  });


  Api.addRoute('like', {authRequired: true}, {
    put: {
      action() {
        console.log('like')
        const articleId = this.bodyParams.articleId;
        const userId = this.userId;
        // const limit = this.urlParams.limit; // parma 값이 없으면 그냥 에러 리턴 그래서 가드를 해줄 필요가 없음...

        console.log(`user: ${userId}, articleId: ${articleId}`)

        return likes.addLike(userId, articleId);
      }
    },
  });

  Api.addRoute('cancellike', {authRequired: true}, {

    put: {
      
      action() {
        console.log('cancel like');

        const articleId = this.bodyParams.articleId;
        const userId = this.userId;
      
        return likes.removeLike(userId, articleId)
      }
    },
  });


}