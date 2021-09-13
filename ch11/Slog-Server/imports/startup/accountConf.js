import { Accounts } from 'meteor/accounts-base';
import { Likes } from '../api/collections'

Accounts.onCreateUser((options, user) => {
  console.log(`create user ${user._id} `);
  Likes.insert({userId: user._id, likeGroup:[]});
  
  return user;
});