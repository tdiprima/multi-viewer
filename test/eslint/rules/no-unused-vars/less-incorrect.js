// https://eslint.org/docs/rules/no-unused-vars
/* eslint no-unused-vars: "error" */

const x = 10
alert(x)

// foo is considered used here
myFunc(function foo () {
  // ...
});

(function (foo) {
  return foo
})()

let myFunc
myFunc = setTimeout(function () {
  // myFunc is considered used
  myFunc()
}, 50)

// Only the second argument from the destructured array is used.
function getY ([, y]) {
  return y
}
