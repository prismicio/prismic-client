export interface Cookie {
  [key: string]: string;
  value: string;
}

// Some portions of code from https://github.com/jshttp/cookie

var decode = decodeURIComponent;

function tryDecode(str: string, decode: (str: string) => string) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

function parse(str: string, options?: any) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = <Cookie>{};
  var opt = options || {};
  var pairs = str.split(/; */);
  var dec = opt.decode || decode;

  pairs.forEach(function(pair) {
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      return;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  });

  return obj;
}

export default { parse };
