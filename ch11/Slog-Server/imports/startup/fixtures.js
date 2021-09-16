import { Meteor } from 'meteor/meteor';
import { Articles, Likes } from '../api/collections';
import { getCurrentDate } from '../utils/formatDate';

function insertAticle(values) {
  Articles.insert(values);
}

Meteor.setTimeout(() => {

  if(Meteor.users.find().count() === 0) {
    console.log('user create');

    const userValue = {
      email: 'user1@user1.com',
      password: 'user1'
    }

    const newUser =  Accounts.createUser(userValue);

    if(Articles.find().count() === 0) {
      let count = 1;
      while(count <= 50) {

        const values = {
          userId: newUser,
          content: `content_${count}`,
          createdAt: getCurrentDate(),
          commentCount: 0,
          likeCount: 0,          
          likeUsers: [],          
        }

        console.log(`create content ${count}`);
        insertAticle(values);
        count = count + 1;
      }
    }
    // if(Likes.find({userId:newUser}).count() === 0) {
    //   Likes.insert({userId: newUser, likeGroup:[]});
    // }
  }

}, 3000);