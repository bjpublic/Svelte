import { Comments, Articles } from './collections';
import { successMessage, failMessage } from '../utils/messages';
import { getCurrentDate } from '../utils/formatDate';

const comments = {

  async addComment(param) {

    const values = {
      userId: param.userId,
      articleId: param.articleId,
      content: param.content,
      createdAt: getCurrentDate(),
    }

    console.log(`userId: ${values.userId}, articleId: ${values.articleId}, content: ${values.content}`);

    try {

      const addResult = await Comments.insert(values);

      await Articles.update(
        {_id: values.articleId},
        {$inc: {commentCount: 1}}
      );

      const newComment = await Comments.findOne({_id: addResult});
      const userName = await Meteor.users.findOne(values.userId);      
      
      newComment.userName = userName.emails[0].address;
        
      return newComment;

      // return successMessage(`comment add Message:, ${newComment}`);
    }
    catch(error) {
      failMessage(`comment add Error: ${error}`)
    }
  },
  async removeComment(param) {

    const values = {
      _id: param._id,
      userId: param.userId,
      articleId: param.articleId,
    }

    const isComment = Comments.find(values._id).count();
    if( isComment === 0) {
      return failMessage(`Comment not found!`);
    }

    const commentUserId = Comments.findOne({_id:values._id}); 
    if(commentUserId.userId !== values.userId) {
      return failMessage(`You do not have permission.`);
    }
      
    try {
      const aritcleResult  = await Articles.update(
        {_id: values.articleId},
        {$inc: {commentCount: -1}}
      )      
      const result = Comments.remove(values._id);
      return successMessage(`comment remove Message: ${result}, ${aritcleResult}`);
    }
    catch(error) {
      return failMessage(`comment remove Error: ${error}`)
    }
  },
  async readComments(articleId) {
    // console.log(`articleId2: ${articleId}`)
    const comments = await Comments.find({articleId:articleId}).fetch();
    
    comments.map(comment => {
      const userName = Meteor.users.findOne(comment.userId)
      if(userName) {
        comment.userName = userName.emails[0].address;
      }
      else {
        comment.userName = 'noName';
      }
      return comment
    })

    return comments;
  }
}

export default comments