import { Mongo } from 'meteor/mongo';

const Articles = new Mongo.Collection('article');
const Comments = new Mongo.Collection('comment');
const Likes = new Mongo.Collection('like');
export {
  Articles,
  Comments,
  Likes,
}