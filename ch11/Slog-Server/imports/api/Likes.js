import { Likes, Articles } from './collections';
import { successMessage, failMessage } from '../utils/messages';

const likes = {
  async addLike(userId, articleId) {
    try {

      console.log(`user: ${userId}, articleId: ${articleId}`)

      const resultLikes = await Likes.update(
        {userId: userId},
        {$addToSet: {likeGroup: articleId}}
      );
  
      const resultArticle = await Articles.update(
        {_id: articleId},
        {
          $addToSet: {likeUsers: userId},
          $inc: {likeCount: 1}
        }
      );


      return successMessage(`success add like ${resultLikes}, ${resultArticle}`);

    }
    catch(error) {
      return failMessage(`like add error ${error}`);
    }
  },
  async removeLike(userId, articleId) {
    
    try {
      const resultLikes = await Likes.update(
        {userId: userId},
        {$pull: {likeGroup: articleId}}
      );
      
      const resultArticle = await Articles.update(
        {_id: articleId},
        {
          $pull: {likeUsers: userId},
          $inc: {likeCount: -1}
        }
      );

      return successMessage(`success remove like ${resultLikes} ${resultArticle}`);
    }
    catch(error) {
      return failMessage(`like remove error ${error}`);
    }
  },
  async readLikes(param) {

    const userId = param.userId;
    const page = Number(param.page);
    const pageSize = 10;

    // if(page <= 1) {
    //   skip = 0;
    //   limit = 5;
    // } else {
    //   limit = page * pageSize; // 2page 일때 limit:10, skip:5, 3일때 limit:15, skip: 10
    //   skip = limit - pageSize;
    // }

    let skip = 0;
    let limit = 0;
    
    if(page <= 1) {
      skip = 0;
      limit = pageSize;
    } else {
      limit = pageSize;
      skip = ((page-1)*pageSize)
    }    

    try {
      const likeIds = await Likes.findOne({userId: userId});
      const likes = await Articles.find({_id: {$in: likeIds.likeGroup}},{skip: skip, limit:limit}).fetch();

      likes.map(article => {

        const likeCheck = article.likeUsers.find(likeUser => likeUser === userId);
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

        return article;
      });

      const totalCount = Articles.find({_id: {$in: likeIds.likeGroup}}).count();
      const totalPage = Math.ceil(totalCount / pageSize);

      const results = {
        articles: likes,
        totalPage: totalPage,
      }
        
      return results;
    }
    catch(error) {
      return failMessage(`read likes error ${error}`);
    }
  }
}

export default likes;