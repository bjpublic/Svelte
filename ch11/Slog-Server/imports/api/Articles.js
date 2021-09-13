import { Articles } from './collections';
import { getCurrentDate } from '../utils/formatDate'
import { successMessage, failMessage } from '../utils/messages';
import { NOMAL_FETCH, MY_FETCH, LIKE_FETCH } from '../constant'
import { insertArticleValidate } from '../utils/validates';

function sleep(ms) {
  const wakeUpTime = Date.now() + ms
  while (Date.now() < wakeUpTime) {}
}

const articles = {

  async addArticle(param) {
    const values = {
      userId: param.userId,
      content: param.content,
      createdAt: getCurrentDate(),
      commentCount: 0,
      likeCount: 0,
      likeUsers: [],
    }

    try {
      
      await insertArticleValidate.validate(values, {abortEarly: false});
      const addResult = await Articles.insert(values);
      const newArticle = await Articles.findOne({_id: addResult});
      const userName = await Meteor.users.findOne(newArticle.userId);
      
      newArticle.userName = userName.emails[0].address;

      // return successMessage(`success insert ${result}`);
      return newArticle;
    }
    catch(error) {

      return failMessage(`Article Add Error: ${JSON.stringify(error)}`);
    }
  },
  async updateArticle(param) {
    const values = {
      _id: param._id,
      content: param.content,
      userId: param.userId,
    }

    try {
      console.log(`updateArticle: ${values._id}`)

      const articleInfo = Articles.findOne(values._id);
      
      if(articleInfo.userId !== values.userId) {
        return failMessage(`It is not authenticated.`);
      }
      
      // await updateArticleSValidate.validate(values, {abortEarly: false});
      const updateArticle = await Articles.update(
        {_id: values._id},
        {$set: {content: values.content}}
      )

      console.log(`updateArticle: ${updateArticle}`)

      const updatedArticle = await Articles.findOne({_id: values._id});
      const userName = await Meteor.users.findOne(values.userId);
      updatedArticle.userName = userName.emails[0].address;;
      console.log(`updateed article: ${JSON.stringify(updatedArticle)}`);
      return updatedArticle;
    }
    catch(error) {  
      // return `Article Update Error: ${error}`
      return failMessage(`Article Update Error: ${JSON.stringify(error)}`);
      
    }
  },
  async removeArticle(param) {

    const values = {
      _id: param._id,
      userId: param.userId
    }
    
    console.log(`_id: ${values._id}, userId: ${values.userId}`);

    try {
      const articleInfo = Articles.findOne(values._id);
      
      console.log(`articleInfo userId: ${articleInfo.userId}`);

      if(articleInfo.userId !== values.userId) {
        return failMessage(`It is not authenticated.`);
      }
      
      const result = await Articles.remove(values._id);
      return successMessage(`Article Remove Message: ${result}`);
    }
    catch(error) {
      // throw `Article remove Error: ${error}`
      return failMessage(`Article Remove Error: ${error}`);
    }
  },
  async readArticle(param) {

    const user = param.user;
    const page = Number(param.page);
    const pageSize = 10;
    const mode = param.mode;

    console.log(`mode: ${mode}`);

    let skip = 0;
    let limit = 0;
    
    if(page <= 1) {
      skip = 0;
      limit = pageSize;
    } else {
      limit = pageSize;
      skip = ((page-1)*pageSize)
    }

    // console.log(`user: ${JSON.stringify(user) }, limit: ${limit}`)
    sleep(500);
    let articles = ''
    if(mode === NOMAL_FETCH) articles = await Articles.find({}, {skip: skip, limit:limit, sort: {createdAt: -1}}).fetch();
    if(mode === MY_FETCH) articles = await Articles.find({userId: user._id}, {skip: skip, limit:limit, sort: {createdAt: -1}}).fetch();

    // console.log(`articles: ${JSON.stringify(articles)}`);

    if(user) {
      articles.map(article => {

        const likeCheck = article.likeUsers.find(likeUser => likeUser === user._id);
        if(likeCheck){
          article.likeMe = true;  
        } 
        else {
          article.likeMe = false;
        } 

        const userName = Meteor.users.findOne(article.userId);
        
        if(userName) {
          article.userName = userName.emails[0].address;
        }
        else {
          article.userName = 'noName';
        }        
        
        console.log(`userName: ${userName}`)

        return article    
      })
    }
    else {
      articles.map(article => {
        
        article.likeMe = false;

        const userName = Meteor.users.findOne(article.userId);
        
        if(userName) {
          article.userName = userName.emails[0].address;
        }
        else {
          article.userName = 'noName';
        }        
        
        return article;
      })
    }
    // await Articles.find({}, {skip: skip, limit:limit}).fetch(); pageSize
    const totalCount = Articles.find().count();

    const totalPage = Math.ceil(totalCount / pageSize)     

    const results = {
      articles: articles,
      totalPage: totalPage,
    }
      
    return results;
  },
  async readOneArticle(_id) {
    try {
      // return Articles.findOne({_id: _id});
      const article = await Articles.findOne({_id: _id});
      const userName = await Meteor.users.findOne(article.userId);
              
      if(userName) {
        article.userName = userName.emails[0].address;
      }
      else {
        article.userName = 'noName';
      }     

      return article;
    }
    catch(error) {
      return failMessage(`Article readOne Error: ${error} `);
    }
  }
  
}

export default articles;
