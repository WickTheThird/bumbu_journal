import './style.css'

import { my_list } from './merge_sort.js';
import { my_function } from './soring_algo.js';

//arays sunt varabile ca o structura care pot stoca mai multe valori
let fruits =["blueberry", "apple", "banana", "mango"];
let numbers=[1, 2, 3, 4, 5, 6, 7, 8, 9];
//> List Methods
//fruits.push("strawberry");
//fruits.pop();
//fruits.shift();
//let numOfFruits = fruits.length;
//let index= fruits.indexOf('tomato');
//console.log(index);

//> for loop
/*
  for(let i=0; i < fruits.length; i++) {
      console.log(fruits[i]);
  }
*/

//> function Example
let sum = my_function(5, 10);
console.log(sum);


//> sorting/ also reverse
fruits.sort().reverse();

document.querySelector('#app').innerHTML = `

<p class="red">${fruits}</p>
<p class="red">List Len: ${sum}</p>
<p class>List sort: ${my_list(numbers)}</p>

`
