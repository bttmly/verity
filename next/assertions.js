const isEmpty = require("lodash.isempty");
const callsite = require("callsite");

const {
  isSubset,
  assertObjectEquals,
  getCookiesFromResponse,
} = require("./util");

function expectCookies (cookies) {
  if (this._expectedCookies == null) {
    this._expectedCookies = {};
  }

  Object.assign(this._expectedCookies, cookies);

  return function(resp) {
    this.cookies = Object.assign(this.cookies, getCookiesFromResponse(resp));
    const badCookies = [];
    Object.keys(this._expectedCookies).forEach((name) => {
      const expected = this._expectedCookies[name];
      const actual = this.cookies[name]
      if (actual.value !== expected) {
        badCookies.push(name);
      }
    });

    if (!isEmpty(badCookies)) {
      const err = new Error(`Error in cookies: ${badCookies.join(", ")}`);
      err.expected = this._expectedCookies;
      err.actual = this.cookies;
      throw err;
    }
  };
}

function expectHeaders (headers) {
  if (this._expectedHeaders == null) {
    this._expectedHeaders = {};
  }

  return function(resp) {
    const badHeaders = [];
    Object.keys(this._expectedHeaders).forEach((name) => {

    })
    for (var name in this._expectedHeaders) {
      var expected = this._expectedHeaders[name];
      var actual = res.headers[name];
      if (name === "content-type") {
        if (!actual || actual.indexOf(expected) + actual.indexOf("*/*") === -2) {
          badHeaders.push(name);
        }
      } else if (actual !== expected) {
        badHeaders.push(name);
      }
    }
    if (badHeaders.length) {
      var err = new Error("Error in headers: " + badHeaders.join(", "));
      err.actual = res.headers;
      err.expected = this._expectedHeaders;
      throw err;
    }
  };
}

function expectBody (expected) {
  // two frames gets us back to the caller
  const stack = callsite().slice(2);

  return function(resp) {
    try {
      assertObjectEquals(resp.body, expected);
    } catch (err) {
      err.actual = resp.body;
      err.expected = expected;
      err.stack = stack.map(formatFrame).join("\n");
      console.log("message:", err.message);
      throw err;
    }
  };
}

function expectStatus (expected) {
  return function(resp) {
    const actual = resp.statusCode;
    if (actual !== expected) {
      const err = new Error(["Expected status", expected, "but got", actual].join(" "));
      err.actual = actual;
      err.expected = expected;
      throw err;
    }
  };
}

function expectPartialBody (expected) {
  return function(resp) {
    try {
      isSubset(expected, resp.body);
    } catch (err) {
      err.actual = resp.body;
      err.expected = expected;
      throw err;
    }
  };
}

function formatFrame (frame) {
  return [
    frame.getFunctionName() || 'anonymous',
    frame.getFileName(),
    frame.getLineNumber(),
  ].join(" ");
}

module.exports = {
  expectStatus,
  expectHeaders,
  expectCookies,
  expectBody,
  expectPartialBody,
}
