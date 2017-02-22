const deepEqual = require("deep-equal");
const difflet = require("difflet");
const diff = difflet({indent: 2, comment: true}).compare;
const deepmerge = require("deepmerge");

function assertObjectEquals (actual, expected){
  if (!deepEqual(actual, expected)){
    throw new Error(
      `ObjectEqualityAssertionError:\n\u001b[0m${diff(expected, actual)}`
    );
  }
}

/*
  Tests if object a is a subset of object b.

  Easiest way to do this is

    b' = deepmerge(b, a)
    return equal(b', b)

  Will not necessarily work if any values are arrays
  of elements, since the arrays would need to be in
  sorted order. Unclear what that means for arrays
  of objects.
 */
function isSubset (subset, actual) {
  var expected;
  expected = deepmerge(actual, subset);
  if(!deepEqual(actual, expected)) {
    throw new Error(
      `ObjectPartialAssertionError\n\u001b[0m${diff(expected, actual)}`
    );
  }
}

function getCookiesFromResponse (res){
  var cookies = {};
  if (res.headers["set-cookie"]){
    res.headers["set-cookie"].forEach(function(cookie){
      cookie = cookieStringToObject(cookie);
      if (cookie.value === ""){
        delete cookies[cookie.name];
      } else {
        cookies[cookie.name] = cookie;
      }
    });
  }
  return cookies;
};

function cookieStringToObject (str){
  var obj = {};
  var pairs = str.toString().split(";");
  pairs.forEach(function(pair){
    var pieces = pair.trim().split("=");
    pieces = pieces.map(function(str){
      return str.trim();
    });
    var key = [ "Domain", "Path", "Expires", "Secure" ];
    if (key.indexOf(pieces[0]) === -1){
      obj.name = pieces[0];
      obj.value = pieces[1];
    } else {
      obj[pieces[0]] = pieces[1];
      if (pieces[0] == "Secure"){
        obj[pieces[0]] = true;
      }
    }
  });
  return obj;
};


function makeCombinedError (errors) {
  const keys = Object.keys(errors);
  const first = errors[keys[0]];
  const msg = [];

  keys.forEach(function(name) {
    msg.push(
      formatHeader(name),
      errors[name].message
    );
  });

  console.log("CREATE COMBINED ERROR");
  const err = new Error(`Expectations failed:\n\u001b[0m${msg.join("\n")}`);
  err.stack = first.stack;
  return err;
}

function formatHeader (title) {
  var logChar = "#";
  var row1 = "";
  var row2 = ` ${title} `;
  var row3 = "";
  while(row1.length < row2.length) {
    row1 = row1 + logChar;
    row3 = row3 + logChar;
  }
  for (var i = 0; i < 10; i++) {
    row1 = logChar + row1 + logChar;
    row2 = logChar + row2 + logChar;
    row3 = logChar + row3 + logChar;
  }

  return `\n\n${[row1, row2, row3].join("\n")}\n\n`;
};

module.exports = {
  getCookiesFromResponse,
  assertObjectEquals,
  makeCombinedError,
  isSubset,
};
