const crypto = require('crypto');
var path = require("path");
var reque = require('request');
var fs = require("fs");
console.log("载入gongju模块");
var gongu = {};
exports = module.exports = gongu

/* gongu.deepcopy=function(obj){//深 度复 制   
let type= typeof obj;
console.log(type=="object",obj);q
  if(type=="object"){
      let newobj={};
      for(key in obj){
          if(obj.propertyIsEnumerable(key)){
            newobj[key]=gongu.deepcopy(obj[key])
          }
      }
      return newobj;
}else{
  return obj;
}
} */

gongu.deepcopy2 = function (obj, newObj, lv) {//限制最多克隆3级
  if (!lv) lv = 0;
  if (lv > 3) return newObj;
  var newObj = newObj || {};
  for (let key in obj) {
    if (obj[key] && typeof obj[key] == 'object') {
      newObj[key] = (obj[key].constructor === Array) ? [] : {}
      gongu.deepcopy2(obj[key], newObj[key], ++lv);
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj;
}

gongu.deepcopy = function (obj, newObj) {
  var newObj = newObj || {};
  for (let key in obj) {
    if (typeof obj[key] == 'object') {
      newObj[key] = (obj[key].constructor === Array) ? [] : {}
      gongu.deepcopy(obj[key], newObj[key]);
    } else {
      newObj[key] = obj[key]
    }
  }
  return newObj;
}


gongu.encrypt = function (str) { //aes加密
  if (typeof str != "string") {
    str = str.toString();
  }
  var cipher = crypto.createCipheriv('aes-128-cbc', 'aaa5b4cf89949207', "16db271db12d4d47");
  encrypted = cipher.update(str, 'utf8', 'hex');
  encrypted += cipher.final('hex'); //参数可以是 'binary', 'base64' 或 'hex'。如果没有传入值，将返回 buffer。
  return encrypted;
}
gongu.decrypt = function (str) { //aes解密
  var Decipher = crypto.createDecipheriv('aes-128-cbc', 'aaa5b4cf89949207', "16db271db12d4d47");
  decrypted = Decipher.update(str, 'hex', 'utf8')
  decrypted += Decipher.final("utf8");
  return decrypted
}
gongu.hhenc = function () { //混合加密
  var max = 0;
  var str = "";
  for (
    var i = 0; i < arguments.length; i++) {
    if (max < arguments[i].length) {
      max = arguments[i].length
    }
  }
  for (
    var i = 0; i < arguments.length; i++) {
    if (arguments[i].length < max) {
      var l = arguments[i].length;
      for (
        var n = 1; n <= max - l; n++) {
        arguments[i] = arguments[i] + "*";
      }
    }
  }
  for (
    var n = 0; n < max; n++) {
    for (
      var i = 0; i < arguments.length; i++) {
      str += arguments[i].charAt(n);
    }
  }
  return str;
}
gongu.hhdec = function (str, l) { //混合解密
  var arr = [];
  for (
    var a = 0; a < l; a++) {
    arr.push("");
  }
  var i = 0;
  for (
    var n = 0; n < str.length; n++) {
    if (str.charAt(n) != "*") {
      arr[i] += str.charAt(n);
    }
    i++;
    if (i >= l) {
      i = 0;
    }
  }
  return arr;
}
gongu.sign = sign;
function sign(a) {
  function b(a, b) {
    return a << b | a >>> 32 - b
  }
  function c(a, b) {
    var c, d, e, f, g;
    return e = 2147483648 & a,
      f = 2147483648 & b,
      c = 1073741824 & a,
      d = 1073741824 & b,
      g = (1073741823 & a) + (1073741823 & b),
      c & d ? 2147483648 ^ g ^ e ^ f : c | d ? 1073741824 & g ? 3221225472 ^ g ^ e ^ f : 1073741824 ^ g ^ e ^ f : g ^ e ^ f
  }
  function d(a, b, c) {
    return a & b | ~a & c
  }
  function e(a, b, c) {
    return a & c | b & ~c
  }
  function f(a, b, c) {
    return a ^ b ^ c
  }
  function g(a, b, c) {
    return b ^ (a | ~c)
  }
  function h(a, e, f, g, h, i, j) {
    return a = c(a, c(c(d(e, f, g), h), j)),
      c(b(a, i), e)
  }
  function i(a, d, f, g, h, i, j) {
    return a = c(a, c(c(e(d, f, g), h), j)),
      c(b(a, i), d)
  }
  function j(a, d, e, g, h, i, j) {
    return a = c(a, c(c(f(d, e, g), h), j)),
      c(b(a, i), d)
  }
  function k(a, d, e, f, h, i, j) {
    return a = c(a, c(c(g(d, e, f), h), j)),
      c(b(a, i), d)
  }
  function l(a) {
    for (
      var b, c = a.length,
      d = c + 8,
      e = (d - d % 64) / 64, f = 16 * (e + 1), g = new Array(f - 1), h = 0, i = 0; c > i;) b = (i - i % 4) / 4,
        h = i % 4 * 8,
        g[b] = g[b] | a.charCodeAt(i) << h,
        i++;
    return b = (i - i % 4) / 4,
      h = i % 4 * 8,
      g[b] = g[b] | 128 << h,
      g[f - 2] = c << 3,
      g[f - 1] = c >>> 29,
      g
  }
  function m(a) {
    var b, c, d = '',
      e = '';
    for (c = 0; 3 >= c; c++) b = a >>> 8 * c & 255,
      e = '0' + b.toString(16),
      d += e.substr(e.length - 2, 2);
    return d
  }
  function n(a) {
    a = a.replace(/\r\n/g, '\n');
    for (
      var b = '',
      c = 0; c < a.length; c++) {
      var d = a.charCodeAt(c);
      128 > d ? b += String.fromCharCode(d) : d > 127 && 2048 > d ? (b += String.fromCharCode(d >> 6 | 192), b += String.fromCharCode(63 & d | 128)) : (b += String.fromCharCode(d >> 12 | 224), b += String.fromCharCode(d >> 6 & 63 | 128), b += String.fromCharCode(63 & d | 128))
    }
    return b
  }
  var o, p, q, r, s, t, u, v, w, x = [],
    y = 7,
    z = 12,
    A = 17,
    B = 22,
    C = 5,
    D = 9,
    E = 14,
    F = 20,
    G = 4,
    H = 11,
    I = 16,
    J = 23,
    K = 6,
    L = 10,
    M = 15,
    N = 21;
  for (a = n(a), x = l(a), t = 1732584193, u = 4023233417, v = 2562382102, w = 271733878, o = 0; o < x.length; o += 16) p = t,
    q = u,
    r = v,
    s = w,
    t = h(t, u, v, w, x[o + 0], y, 3614090360),
    w = h(w, t, u, v, x[o + 1], z, 3905402710),
    v = h(v, w, t, u, x[o + 2], A, 606105819),
    u = h(u, v, w, t, x[o + 3], B, 3250441966),
    t = h(t, u, v, w, x[o + 4], y, 4118548399),
    w = h(w, t, u, v, x[o + 5], z, 1200080426),
    v = h(v, w, t, u, x[o + 6], A, 2821735955),
    u = h(u, v, w, t, x[o + 7], B, 4249261313),
    t = h(t, u, v, w, x[o + 8], y, 1770035416),
    w = h(w, t, u, v, x[o + 9], z, 2336552879),
    v = h(v, w, t, u, x[o + 10], A, 4294925233),
    u = h(u, v, w, t, x[o + 11], B, 2304563134),
    t = h(t, u, v, w, x[o + 12], y, 1804603682),
    w = h(w, t, u, v, x[o + 13], z, 4254626195),
    v = h(v, w, t, u, x[o + 14], A, 2792965006),
    u = h(u, v, w, t, x[o + 15], B, 1236535329),
    t = i(t, u, v, w, x[o + 1], C, 4129170786),
    w = i(w, t, u, v, x[o + 6], D, 3225465664),
    v = i(v, w, t, u, x[o + 11], E, 643717713),
    u = i(u, v, w, t, x[o + 0], F, 3921069994),
    t = i(t, u, v, w, x[o + 5], C, 3593408605),
    w = i(w, t, u, v, x[o + 10], D, 38016083),
    v = i(v, w, t, u, x[o + 15], E, 3634488961),
    u = i(u, v, w, t, x[o + 4], F, 3889429448),
    t = i(t, u, v, w, x[o + 9], C, 568446438),
    w = i(w, t, u, v, x[o + 14], D, 3275163606),
    v = i(v, w, t, u, x[o + 3], E, 4107603335),
    u = i(u, v, w, t, x[o + 8], F, 1163531501),
    t = i(t, u, v, w, x[o + 13], C, 2850285829),
    w = i(w, t, u, v, x[o + 2], D, 4243563512),
    v = i(v, w, t, u, x[o + 7], E, 1735328473),
    u = i(u, v, w, t, x[o + 12], F, 2368359562),
    t = j(t, u, v, w, x[o + 5], G, 4294588738),
    w = j(w, t, u, v, x[o + 8], H, 2272392833),
    v = j(v, w, t, u, x[o + 11], I, 1839030562),
    u = j(u, v, w, t, x[o + 14], J, 4259657740),
    t = j(t, u, v, w, x[o + 1], G, 2763975236),
    w = j(w, t, u, v, x[o + 4], H, 1272893353),
    v = j(v, w, t, u, x[o + 7], I, 4139469664),
    u = j(u, v, w, t, x[o + 10], J, 3200236656),
    t = j(t, u, v, w, x[o + 13], G, 681279174),
    w = j(w, t, u, v, x[o + 0], H, 3936430074),
    v = j(v, w, t, u, x[o + 3], I, 3572445317),
    u = j(u, v, w, t, x[o + 6], J, 76029189),
    t = j(t, u, v, w, x[o + 9], G, 3654602809),
    w = j(w, t, u, v, x[o + 12], H, 3873151461),
    v = j(v, w, t, u, x[o + 15], I, 530742520),
    u = j(u, v, w, t, x[o + 2], J, 3299628645),
    t = k(t, u, v, w, x[o + 0], K, 4096336452),
    w = k(w, t, u, v, x[o + 7], L, 1126891415),
    v = k(v, w, t, u, x[o + 14], M, 2878612391),
    u = k(u, v, w, t, x[o + 5], N, 4237533241),
    t = k(t, u, v, w, x[o + 12], K, 1700485571),
    w = k(w, t, u, v, x[o + 3], L, 2399980690),
    v = k(v, w, t, u, x[o + 10], M, 4293915773),
    u = k(u, v, w, t, x[o + 1], N, 2240044497),
    t = k(t, u, v, w, x[o + 8], K, 1873313359),
    w = k(w, t, u, v, x[o + 15], L, 4264355552),
    v = k(v, w, t, u, x[o + 6], M, 2734768916),
    u = k(u, v, w, t, x[o + 13], N, 1309151649),
    t = k(t, u, v, w, x[o + 4], K, 4149444226),
    w = k(w, t, u, v, x[o + 11], L, 3174756917),
    v = k(v, w, t, u, x[o + 2], M, 718787259),
    u = k(u, v, w, t, x[o + 9], N, 3951481745),
    t = c(t, p),
    u = c(u, q),
    v = c(v, r),
    w = c(w, s);
  var O = m(t) + m(u) + m(v) + m(w);
  return O;
};
gongu.md5 = md5;
gongu.hamc = hamc;
function hamc(str, pass) {
  if (typeof str != "string") {
    str = str.toString();
  }
  var dec = crypto.createHmac("sha1", pass);
  str = dec.update(str).digest("base64");
  return str;
}
function md5(str) {
  if (typeof str != "string") {
    str = str.toString();
  }
  var hash = crypto.createHash("md5");
  str = hash.update(str).digest("hex");
  return str;
}
gongu.zyenc = function (text, key) { //自用加密
  var buf1 = Buffer.from(text);
  var buf2 = Buffer.alloc(buf1.length * 2);
  for (
    var pair of buf1.entries()) {
    if (pair[1] > 150) {
      buf2.writeUInt8(gongu.qqjsjs(65, 90), pair[0] * 2);
      buf2.writeUInt8(pair[1] - key, pair[0] * 2 + 1);
    } else {
      buf2.writeUInt8(gongu.qqjsjs(97, 122), pair[0] * 2);
      buf2.writeUInt8(pair[1] + key, pair[0] * 2 + 1);
    }
  }
  return buf2.toString("hex")
}
gongu.zydec = function (text, key) { //自用解密
  var buf1 = Buffer.from(text, "hex");
  var buf2 = Buffer.alloc(buf1.length / 2 + 50);
  var i = 0;
  while (i <= buf1.length - 1) {
    if (buf1[i] >= 65 && buf1[i] <= 90) {
      buf2.writeUInt8(buf1[i + 1] + key, i / 2)
    } else {
      buf2.writeUInt8(buf1[i + 1] - key, i / 2)
    }
    i += 2;
  }
  return buf2.slice(0, buf2.indexOf(0)).toString('utf8');
}
gongu.numend = function (num) { //数字加密
  num = num + 1000;
  var n = num << 6;
  var str = Math.random().toString(36).substr(2, 3) + n.toString(16);
  var s = "";
  for (
    var i in str) {
    s = s + randstr(2) + str[i];
  }
  return s;
};
gongu.numdec = function (str) { //数字解密
  if (!str) return - 1;
  var s = "";
  for (
    var i in str) {
    if ((i + 1) % 3 == 0) {
      s += str[i];
    }
  }
  str = s;
  str = str.substr(3);
  var n = parseInt(str, 16);
  n >>= 6;
  return n - 1000;
};
gongu.isMobile = { //判断手机类型
  Android: function (ua) {
    return !!ua.match(/Android/i)
  },
  BlackBerry: function (ua) {
    return !!ua.match(/BlackBerry/i)
  },
  iOS: function (ua) {
    return !!ua.match(/iPhone|iPad|iPod/i)
  },
  Windows: function (ua) {
    return !!ua.match(/IEMobile/i)
  },
  Weixin: function (ua) {
    return !!ua.match(/MicroMessenger/i)
  },
  Weibo: function (ua) {
    return !!ua.match(/weibo/i)
  },
  QQ: function (ua) {
    return !!ua.match(/mqqbrowser/i)
  },
  QQ2: function (ua) {
    return !!ua.match(/QBWebView/i)
  },
}

var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
function randstr(n) { //取随机字符
  var res = "";
  for (
    var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }
  return res;
}

gongu.randstr = randstr;
var nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
function randnum(n) { //取随机数字
  var res = "";
  for (
    var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 9);
    res += chars[id];
  }
  return res;
}

gongu.qqjsjs = function (min, max) { //取区间随机整数
  return Math.floor(min + Math.random() * (max - min + 1));
}

Object.defineProperty(Object.prototype, "addkey", {
  value: function (key, value) { //动态添加属性
    if (key) {
      this[key] = value
    }
    return this
  },
  enumerable: false,
  configurable: false
})

gongu.randnum = randnum;
gongu.qwbzj = function (text, str, end) { //取文本中间
  if (typeof text != "string") {
    if (text == '') {
      console.log("text不能为空");
      return ''
    }
    text = text.toString();
  }
  if (str == '') {
    var wz = 0;
  } else {
    var wz = text.indexOf(str);
  }
  if (wz != -1) {
    wz2 = text.indexOf(end, wz + str.length);
    if (wz2 != -1) {
      //return v.substring(v.indexOf("、")+1,v.lastIndexOf("—")-1)  
      return text.slice(wz + str.length, wz2)
    }
  }
  return '';
}

gongu.removeszcf = function (arr) { //数组去重
  for (
    var i = 0; i < arr.length - 1; i++) {
    for (
      var j = i + 1; j < arr.length; j++) {
      if (arr[i] == arr[j]) {
        arr.splice(j, 1);
        j--;
      }
    }
  }
  return arr;
  Array.prototype.removeItem = function (cb) {
    if (this.length == 0) return;
    var counter = this.length - 1;
    while (true) {
      var result = cb(this[counter]);
      if (result) {
        this.splice(counter, 1);
        counter = this.length - 1;
      }
      else {
        counter--;
      }
      if (counter < 0) {
        break;
      }
    }
  }
}
gongu.dlwst = function (n) { //到两位数文本
  if (n < 10) {
    return '0' + n.toString()
  } else {
    return n.toString()
  }
}
gongu.isasync = function (f) { //判断是否为异步函数
  if (typeof f == "function") {
    return f.constructor.toString().indexOf("Async") > 0
  }
  return false;
}

gongu.getfile = async function (path) { //异步读文件内容
  return new Promise(function (resolve, reject) {
    fs.readFile(path, 'utf-8',
      function (err, data) {
        if (err) {
          reject("读文件失败")
        } else {
          resolve(data);
        }
      });
  })
}

gongu.writefile = async function (path, data) { //异步写文件内容
  return new Promise(function (resolve, reject) {
    fs.writeFile(path, data,
      function (err) {
        if (err) {
          reject("保存文件失败");
        } else {
          resolve("保存文件成功");
        }
      })
  })
}

gongu.renamefile = async function (oldpath, newpath) { //异步重命名文件
  return new Promise(function (resolve, reject) {
    fs.rename(oldpath, newpath,
      function (err) {
        if (err) {
          reject(err)
        } else {
          resolve("1")
        }
      })
  })
}

gongu.movefile = async function (oldpath, newpath) { //异步移动文件支持跨磁盘分区
  return new Promise(function (resolve, reject) {
    var readStream = fs.createReadStream(oldpath);
    var writeStream = fs.createWriteStream(newpath); //需先保证newpath的父目录已存在
    readStream.pipe(writeStream);
    readStream.on('end',
      function () {
        fs.unlinkSync(oldpath);
        resolve(1)
      })
    readStream.on('error',
      function () {
        reject(0)
      })
  })
}

gongu.runcmdstr = async function (runcmd, cmdstr, cwd) { //cdw为子进程工作目录
  return new Promise(function (resolve, reject) {
    runcmd(cmdstr, {
      cwd: cwd
    },
      function (err, stdout, stderr) {
        if (err) {
          console.log("cmderr");
          console.log(err);
          reject(err);
        } else {
          console.log(stdout);
          resolve(stdout);
        }
      })
  })
}

gongu.date = {};
gongu.date.qbydyt = function (date) { //取月份的第一天
  if (!date) {
    var date = new Date();
  }
  date.setDate(1)
  return date
}
gongu.date.qbyzhyt = function (date) { //取月份的最后一天
  if (!date) {
    var date = new Date();
  }
  var currentMonth = date.getMonth();
  var nextMonth = ++currentMonth;
  var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
  var oneDay = 1000 * 60 * 60 * 24;
  return new Date(nextMonthFirstDay - oneDay);
}
gongu.todatestring = function (date, fmt) { //时间到文本 MDhmsqS yyyy-MM-DD
  var o = {
    "M+": date.getMonth() + 1,
    // 月份
    "D+": date.getDate(),
    // 日
    "h+": date.getHours(),
    // 小时
    "m+": date.getMinutes(),
    // 分
    "s+": date.getSeconds(),
    // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3),
    // 季度
    "S": date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (
    var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

Date.prototype.totext = function (fmt) { //时间到文本 MDhmsqS yyyy-MM-DD
  var o = {
    "M+": this.getMonth() + 1,
    // 月份
    "D+": this.getDate(),
    // 日
    "h+": this.getHours(),
    // 小时
    "m+": this.getMinutes(),
    // 分
    "s+": this.getSeconds(),
    // 秒
    "q+": Math.floor((this.getMonth() + 3) / 3),
    // 季度
    "S": this.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (
    var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

gongu.httpget = async function (url, headers, jar, encoding, option) { //httpget
  var options = {
    url: url,
    headers: headers,
    strictSSL: false,
    ...option
  }
  if (jar) {
    options.jar = jar;
  }
  if (encoding || encoding == null) {// 为null 时返回的body为buff 
    options.encoding = encoding;
  }

  return new Promise(function (resolve, reject) {
    reque.get(options,
      function (err, reshone, body) {
        if (err) {
          reject(err)
        } else {
          resolve(reshone);
        }
      })
  })
}


gongu.httppostform = async function (url, formData, headers, jar, encoding, option) { //httppost
  var options = {
    url: url,
    formData: formData,
    headers: headers,
    strictSSL: false,
    ...option
  }
  if (jar) {
    options.jar = jar;
  }
  if (encoding || encoding == null) {// 为null 时返回的body为buff 
    options.encoding = encoding;
  }
  return new Promise(function (resolve, reject) {
    reque.post(options,
      function (err, reshone, body) {
        if (err) {
          reject(err)
        } else {
          resolve(reshone);
        }
      })
  })
}

gongu.delay = async function (n) {//延时
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, n * 1000)
  })
}

gongu.httppost = async function (url, form, headers, jar, encoding, option) { //httppost
  var options = {
    url: url,
    form: form,
    headers: headers,
    strictSSL: false,
    ...option
  }
  if (jar) {
    options.jar = jar;
  }
  if (encoding || encoding == null) {// 为null 时返回的body为buff 
    options.encoding = encoding;
  }
  return new Promise(function (resolve, reject) {
    reque.post(options,
      function (err, reshone, body) {
        if (err) {
          reject(err)
        } else {
          resolve(reshone);
        }
      })
  })
}

gongu.wbtcn = async function (url) { //t.cn分享生成接口
  var head = {
    "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.122 Safari/537.36 SE 2.X MetaSr 1.0",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,;q=0.8,application/signed-exchange;v=b3",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-Control": "max-age=0",
  }
  return new Promise(function (resolve, reject) {
    gongu.httpget("https://service.weibo.com/share/share.php?url=" + encodeURIComponent(url) + "&title=A Happy Day", head).then(function (response) {
      var tcn = gongu.qwbzj(response.body, 'scope.short_url = "', '"');
      if (tcn) {
        tcn = tcn.trim()
        resolve(tcn)
      } else {
        resolve(0)
      }
    }).
      catch(function (e) {
        console.log(e)
        resolve(0)
      })
  })
}
gongu.createpath = async function (dirnamea) { //创建目录 支持多级创建
  return new Promise(function (resolve, reject) {
    fs.access(dirnamea, async function (err) {
      if (!err) { //文件存在
        resolve(1);
      } else { //不存在
        var n = await gongu.createpath(path.dirname(dirnamea));
        console.log(dirnamea);
        if (n) {
          fs.mkdir(dirnamea,
            function (err) {
              if (err) {
                resolve(0)
              } else {
                resolve(1)
              }
            })
        } else {
          resolve(0);
        }
      }
    })
  })
}


