var goods = [
  {id:1, name:'A Goods', category:'a', price: 1000},
  {id:2, name:'B Goods', category:'b', price: 2000},
  {id:3, name:'C Goods', category:'c', price: 2500},
  {id:4, name:'D Goods', category:'a', price: 500},
  {id:5, name:'E Goods', category:'b', price: 10000},
  {id:6, name:'F Goods', category:'d', price: 5000}
];

// let names = []
// for (var i=0; i < goods.length; i++ ) {
//     names.push(goods[i].name)
// }
// console.log(names)

const names = goods.map(g => g.name);
console.log(names);

const goods2 = goods.filter(g => g.price > 1000);
console.log(goods2);

const name1 = goods.find(g => g.id === '3');
console.log(name1);

const sum = goods.reduce((sum, good) => {
  return sum + good.price;
}, 0)
console.log(sum)

let arr1 = [1,2,3]
let arr2 = [0, ...arr1, 4] // 0,1,2,3,4
console(arr2);

const obj1 = {a: 1, b: 2}
const obj2 = {c: 3}
console.log({...obj1, ...obj2}) // {a: 1, b: 2, c: 3}
