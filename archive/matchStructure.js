// Oct 9, 2020
// node matchStructure.js
function hasEqualStructure(obj1, obj2) {
  return Object.keys(obj1).every(key => {
    let v = obj1[key];

    if (typeof v === 'object' && v !== null) {
      return hasEqualStructure(v, obj2[key]);
    }

    return Object.prototype.hasOwnProperty.call(obj2, key);
  });
}

// eslint-disable-next-line no-unused-vars
function toMatchStructure(actual, expected) {
  let pass = hasEqualStructure(actual, expected);
  let message = `expected ${JSON.stringify(expected)} to match structure ${JSON.stringify(actual)}`;
  console.log('pass', pass);
  console.log('message', message);
}

let actual = {
  foo: 1,
  bar: 2,
  bas: {
    baz: 3
  }
};

let expected = {
  foo: 1,
  bar: 2,
  zoo: 4,
  bas: {
    baz: 3
  }
};

// let actual = {
//   brand: 'brand 1',
//   navigation: { opacity: 0.2 }
// };
//
// let expected = {
//   brand: 'brand 2',
//   navigation: { opacity: 0.5 }
// };

// toMatchStructure(actual, expected);

for (let key in expected) {
  if (actual.hasOwnProperty(key)) {
    console.log(key);
  } else {
    console.log(key, 'not exist');
    actual[key] = expected[key];
  }
}
console.log(actual);
