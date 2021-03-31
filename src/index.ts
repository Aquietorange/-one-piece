import 'source-map-support/register'//node.js 错误栈转ts 模块
import fs from "fs"
import gongju from "../lib/gongju.js"
let wbsso = require("../lib/wbsso.js")
import iconv from "iconv-lite"
import request from 'request';
//import { exec } from 'child_process';
var FileCookieStore = require('tough-cookie-filestore');
import { promisify } from "util";
import log4js, { Logger } from 'log4js'
let util = require('util');
import { EventEmitter } from "events"
import express, { Express, Request, Response } from "express";
const cluster = require("cluster");
var bodyParser = require('body-parser');
var CronJob = require('cron').CronJob;
const app: Express = express();



if (process.env.NODE_ENV == "test") {
    var pdcloud: any = { notification: { info: (a: string) => { } } }
    app.use(express.static("E:\\云同步\\ipadwx\\返利机器人\\www.grammarly.com"))//添加静态资源文件夹
    app.use(express.static("E:\\中转"))//添加静态资源文件夹
    app.get("/v",(req,res)=>{
        res.send(`domain:baidu.com,
        domain:bdstatic.com,
        domain:qq.com,
        domain:netease.com,
        domain:163.com,
        domain:jianxue.mobi,
        domain:csdn.net,
        domain:weibo.com,
        domain:sina.com,
        domain:sinaimg.cn,
        domain:weibo.cn,
        domain:sina.com.cn,
        domain:icloud.cn,
        domain:shunwang.com,
        domain:aex88.com,
        domain:btc38.com,
        domain:bejson.com,
        domain:aligenie.com,
        domain:aliapp.org,
        domain:alicdn.com,
        domain:cnzz.com,
        domain:huobiasia.vip,
        domain:huobi.fm,
        domain:125.la,
        domain:v2ex.com,
        domain:paypal.com,
        domain:paypalobjects.com,
        domain:gstatic.com,
        domain:doubleclick.net,
        domain:chinaz.com,
        domain:jianxue.xyz,
        domain:bootcss.com,
        geosite:alibaba,
        geosite:alibaba-ads,
        geosite:alibabacloud,
        geosite:aliyun,
        geosite:baidu,
        geosite:baidu-ads,
        geosite:tencent,
        geosite:tencent-ads,
        148.70.39.80`)
    })
    app.listen(19910)
} else {
    var pdcloud: any = require("pdcloud")(app);
}
let kuaidailiddbh = "959033366606460"
let fanqietoke = ""
async function init_fanqie() {
    let d = await gongju.httppost(`http://www.xxxxx.com/login`, { client: 1, userName: "qq528", password: Buffer.from("1234567").toString("base64") }, {}, undefined, 0, { json: true })
    console.log(d.body);
    if (d.body.status == 0) {
        fanqietoke = d.body.token;
    }
}

/**
 *取手机号，失败返回空
 *
 * @param {string} itemid
 * @param {number} operatorChoice 筛选运营商方式 0不限 1包含 2=不含 
 * @param {number} operator  1 2 3 4
 */
async function fanqie_getmobile(itemid: string, operatorChoice: number = 0, operator: number = 4): Promise<string> {
    let d = await gongju.httppost(`http://www.xxxxx.com/getMobile`, { itemId: itemid, token: fanqietoke, operatorChoice, operator }, {}, undefined, 0, { json: true })
    if (d.body.status == 0) {
        return d.body.mobile
    } else {
        return ""
    }
}

/**
 *取指定手机号，失败返回空
 *
 * @param {string} itemid
 * @param {string}mobile
 */
async function fanqie_getzdmobile(itemid: string, mobile: string): Promise<string> {
    let d = await gongju.httppost(`http://www.xxxxx.com/getSpecificMobile`, { itemId: itemid, token: fanqietoke, mobile, addtime: 1 }, {}, undefined, 0, { json: true })
    if (d.body.status == 0) {
        return d.body.mobile
    } else {
        return ""
    }
}




/**
 *取手机验证码，失败或超时返回空
 *
 * @param {string} itemid
 * @param {number} operatorChoice 筛选运营商方式 0不限 1包含 2=不含 
 * @param {number} operator  1 2 3 4
 */
async function fanqie_getcode(mobile: string, itemid: string): Promise<string> {
    let m = [{ mobile, itemId: itemid }]
    let d = await gongju.httppost(`http://www.xxxxx.com/getMobileCode`, { token: fanqietoke, data: JSON.stringify(m) }, {}, undefined, 0, { json: true })
    if (d.body.status == 0 && d.body.data) {
        console.log(d.body.data[0].message)
        if (d.body.data[0].code) {
            return d.body.data[0].code;
        } else {
            return ""
        }
    } else {
        return ""
    }
}
/**
 *循环取手机验证码，失败或超时返回空
 *
 * @param {string} mobile
 * @param {string} itemid 筛选运营商方式 0不限 1包含 2=不含 
 * @param {number} num  超时 单位秒
 */
async function fanqie_getcodefor(mobile: string, itemid: string, num: number): Promise<string> {
    let code = await fanqie_getcode(mobile, itemid)
    let n = 0;
    while (code == "") {
        await gongju.delay(10)
        code = await fanqie_getcode(mobile, itemid)
        n++;
        if (n >= Math.floor(num / 10)) {
            break
        }
    }
    return code;
}





app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
/* 
完善 在API网关 限流过滤器 对APIKEY 查询redis对应套餐次数  限制QPS和日请求次数上限 
套餐类型   限QPS 不限请求次数，  限QPS 限日请求次数,  免费版 限 1 qps,日上限2000次
*/
/* 完善 在API网关 签权过滤器 对ApiKEY 和Apisecret 进行校验 */
app.use("/dwz", async (req: Request, res, next) => {// /dwz?apikey=xxxxxxx&url=http://xxxxxx&sign=aaaaaaaaaaaaa
    let apikey: any = req.query["apikey"]
    let url: any = req.query["url"]
    let error: string = "";
    let domain = gongju.qwbzj(url + "/", "http://", "/") || gongju.qwbzj(url + "/", "https://", "/");
    if (!domain || !url || url.substr(0, 4).toLowerCase() !== "http" || url.length > 290) {
        error = "url error"
    }
    if (!apikey || apikey.length < 10) {
        error = "apikey error"
    }
    if (error) {
        res.json({ succeed: 0, error })
        return;
    }
    if (url.length < 61) {
        res.json({ succeed: 1, dwz: url })
        return
    }
    let r = getnextuser()
    if (r) {
        if (typeof r.user == "string") {
            var cuser = userlist.get(r.user);
            var luser = loginuser.get(r.user);
        } else {
            var cuser: User | undefined = r.user;
            var luser = loginuser.get(r.user.user);
        }




        let tcn: string = await sendmessg(cuser?.messguid, r.jar, url, r.clientId).catch((err): any => {
            return "akdjgoiasdoig"//发送失败时返回此无意义内容
        })
        bugger.info(url);
        bugger.info(tcn);
        if (tcn.indexOf("t.cn") != -1) {
            if (cuser) {
                if (cuser.succeed) {
                    cuser.succeed++;
                } else {
                    cuser.succeed = 1;
                }
            }
            if (luser) {
                luser.lxsb = 0;//重置连续失败次数
            }
            res.json({ succeed: 1, dwz: tcn })
        } else if (cuser) {//判断异常情况
            if (tcn == "account is locked.") {//帐号被锁定  
                cuser.type = "锁定"
                logger.info(cuser.user + "已锁定");
            } else if (tcn == " out of limit!") {
                cuser.type = "异常"
                logger.info(cuser.user + "消息发送异常，待重新激活");
            } else if (tcn == "User does not exists!") {
                cuser.type = "messguid异常"
                logger.info(cuser.user + ",messguid异常，待重新绑定");
            } else if (tcn.indexOf('"retcode":50111309') != -1) {//登陆失效
                cuser.type = "登陆失效"
                logger.info(cuser.user + ",登陆失效，待重新登陆");
            } else {
                logger.info(cuser.user + "未知异常");
            }

            if (cuser) {
                if (cuser.error) {
                    cuser.error++;
                } else {
                    cuser.error = 1;
                }
            }
            if (luser) {
                luser.lxsb = (luser.lxsb || 0) + 1;//连续失败次数+1
            }
            res.json({ succeed: 0, error: "Service error" });
        } else {
            logger.info("未知异常B");
            res.json({ succeed: 0, error: "Service error" });
        }
    } else {
        res.json({ succeed: 0, error: "Service unavailable" })
    }
})

app.post("/login_tel", async (req: Request, res: Response, next) => {//通过手机登陆帐号
    let body = req.body;
    res.json({ succeed: 1, message: "共导入" + body.length + "个帐号" });
    let cg = 0;
    let sb = 0;
    let ul: User[] = []//此次需要登陆的帐号组
    if (!body.length && body.num) {
        let mobiles = []
        for (let i = 0; i < body.num; i++) {
            let a = await fanqie_getmobile("11116", 2)
            await gongju.delay(0.5)
            if (a) {
                mobiles.push(a);
            }
        }
        body = mobiles
    }

    body.map((v: string) => {
        let da = { user: v, pass: 'aaa123456', uid: "0", istel: true }
        userlist.set(v, da);
        ul.push(da)
    })
    loginalluser_assign(ul);
}
)


app.post("/adduser", async (req: Request, res: Response, next) => {
    /* 
     默认所有帐号正常，且已有jar文件
     直接将所有帐号添加到 userlist 并保存
     然后逐一获取clienid并添加到loginuser
    */
    let body = req.body;
    if (body && body.length > 0) {
        body.map((v: [string, any]) => {
            if (v.length > 1) {
                userlist.set(v[0], v[1]);
            }
        })

        saveuserlist();
        res.json({ succeed: 1, message: "其导入" + body.length + "个帐号" });
        let cg = 0;
        let sb = 0;
        await UserMaptoarr(new Map(body)).reduce(function (total: Promise<User> | undefined, cuser: User, arr): Promise<User> {
            return new Promise((resolve, reject) => {
                if (total) {
                    total.finally(() => {
                        loginadduser(cuser).then((r: Luser | undefined) => {
                            if (r) {
                                cg++;
                                logger.info("登陆帐号:" + r.user + "成功");
                            } else {
                                sb++;
                                logger.info("登陆帐号:" + cuser.user + "失败");
                            }
                        }).finally(() => {
                            setTimeout(() => {
                                resolve(cuser)
                            }, 1000)
                        })
                    })
                } else {
                    loginadduser(cuser).then((r: Luser | undefined) => {
                        if (r) {
                            cg++;
                            logger.info("登陆帐号:" + r.user + "成功");
                        } else {
                            sb++;
                            logger.info("登陆帐号:" + cuser.user + "失败");
                        }
                    }).finally(() => {
                        setTimeout(() => {
                            resolve(cuser)
                        }, 1000)
                    })
                }
            })
        }, undefined)
        logger.info(`在线导入帐号完成,成功:${cg},失败:${sb}`);
        saveuserlist();
    }
    //loginuser.set()
})

class TestscTcn extends EventEmitter { }//创建类并继承events模块提供的EventEmitter类
const testtcn = new TestscTcn();//创建事件触发器


const readFileasync = promisify(fs.readFile); // 同步读文件,readFile 转化为 promise

let wbhead: any = {
    Origin: "https://weibo.com",
    Pragma: "no-cache",
    Referer: "https://weibo.com/",
    "Upgrade-Insecure-Requests": 1,
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36"
}

log4js.configure({//https://blog.csdn.net/Iron_Ye/article/details/84076747
    appenders: {
        std: { type: "stdout", level: "all", layout: { type: "basic", } },
        file: { type: "file", filename: "log/" + gongju.todatestring(new Date(), "yyyy-MM-DD") + ".txt", encoding: "utf-8" }
    },
    categories: {
        default: { appenders: ["std"], level: "debug" },
        custom: { appenders: ["std", "file"], level: "all" }
    }
});

let logger = log4js.getLogger("custom");
let bugger = log4js.getLogger("default");




interface User {
    user: string,
    pass: string,
    uid?: String,
    messguid?: string//接收转链消息的用户id
    type?: string// 锁定
    succeed?: number
    error?: number
    istel?: boolean//手机号需用验证码登陆
}
interface Luser {
    clientId: string,
    userinfo: {
        uniqueid: string
        nick: string
    }
    jar: request.CookieJar
    user: string | User,
    lxsb?: number,//连续失败次数
}

let userlist = new Map<string, User>();//所有导入的帐号
let loginuser = new Map<string, Luser>();//所有登陆成功的帐号
let userlistlock = new Map<string, User>();//所有锁定的帐号
let tcniterator: IterableIterator<[string, Luser]>//登陆成功帐号的迭代器，可用来按顺序执行任务



/**
 *登陆在线增加的帐号,本地已有cookie jar文件
 *
 * @param {User} cuser
 * @returns {Promise<any>}
 */
async function loginadduser(cuser: User): Promise<any> {
    let cookiepath: string = __dirname + "/../jar/" + cuser.user + ".json";
    if (!fs.existsSync(cookiepath)) {//不存在jar
        return undefined;
    } else {
        var jar: request.CookieJar
        jar = request.jar(new FileCookieStore(cookiepath))
        let uid = "";
        let nick = "";
        await gongju.httpget("https://weibo.com/", wbhead, jar).then((v) => {
            uid = gongju.qwbzj(v.body, "$CONFIG['uid']='", "';")
            nick = gongju.qwbzj(v.body, "$CONFIG['nick']='", "';")
        }).catch()
        console.log("uid:" + uid)
        if (uid && uid.length < 20) {//cookie未失效
            let r: any = { userinfo: { "uniqueid": uid, nick }, jar, user: cuser.user }
            r.clientId = await getchatclientld(r.jar).catch();
            console.log(r)
            console.log(cuser);
            if (cuser.messguid) {//判断发消息是否正常
                let zt = await sendtestmessg2(cuser.messguid, cuser, jar, r.clientId).catch()
                if (zt == "ok") {//消息发送成功
                    addluser(r);
                    logger.info("消息发送正常," + cuser.user);
                    return r;
                }
            }
            return undefined;
        }
    }
}

/**
 *登陆微博 ,登陆成功加入到loginuser map
 *
 * @param {string} user
 * @param {string} pass
 * @param {request.CookieJar} [jar]
 * @param {string} [code]
 * @param {number} [jc=0]
 * @param {*} [pub]
 * @returns {Promise<any>}
 */
async function login(user: string | User, pass: string, jar?: request.CookieJar, code?: string, jc: number = 0, pub?: any, proxy?: string): Promise<Luser> {
    if (typeof user == "string") {
        var su = Buffer.from(user).toString("base64")
        var cookiepath: string = __dirname + "/../jar/" + user + ".json";
    } else {
        var su = Buffer.from(user.user).toString("base64")
        var cookiepath: string = __dirname + "/../jar/" + user.user + ".json";
    }


    let servertime = Math.ceil(new Date().getTime() / 1000);
  

    if (!fs.existsSync(cookiepath)) {
        fs.closeSync(fs.openSync(cookiepath, 'w'));
        jar = jar || request.jar(new FileCookieStore(cookiepath))
    } else {//存在cookie文件 则验证cookie是否失效，有效则直接返回
        jar = jar || request.jar(new FileCookieStore(cookiepath))
        if (!code && !jc) {//非验证码错误, 判断cookie是否有效
            let uid = "";
            let nick = "";
            uid = await chilcklogin(jar).catch();
            if (uid && uid.length < 20 && uid.length > 5) {//cookie未失效
                let r: any = { userinfo: { "uniqueid": uid, nick }, jar, user }
                r.clientId = await getchatclientld(r.jar).catch();
                if (typeof user == "string") {
                    var cuser = userlist.get(user);
                } else {
                    var cuser: User | undefined = user
                }
                if (cuser && cuser.messguid) {//判断发消息是否正常
                    let zt = await sendtestmessg2(cuser.messguid, cuser, jar, r.clientId).catch()
                    if (zt == "ok") {//消息发送成功
                        addluser(r);
                        delete cuser.type
                        logger.info("消息发送正常," + user);
                    } else {//还需手动测试消息发送out of limit! 是否完全限制
                        if (cuser.type == "登陆失效") {
                            delete cuser.type
                        }
                    }
                } else {
                    addluser(r);
                }
                return r;
            }
        }
    }
    if (!pub) {//重试登陆时 会传入pub无需重新获取
        pub = await gongju.httpget(`https://login.sina.com.cn/sso/prelogin.php?entry=weibo&callback=sinaSSOController.preloginCallBack&su=${encodeURIComponent(su)}&rsakt=mod&checkpin=1&client=ssologin.js(v1.4.19)&_=${new Date().getTime()}`, wbhead, jar).then((v: any) => {
            return new Promise((resolve, reject) => {
                let temp = v.body.match(/preloginCallBack\((.*)\)/)
                if (temp && temp.length >= 1) {
                    v.body = temp[1]
                }
                try {
                    let body = JSON.parse(v.body)
                    resolve(body);
                } catch (err) {
                    bugger.warn(err);
                    resolve(undefined);
                }
            })
        }).catch()
    }

    if (typeof user == "string") {
        var cuser = userlist.get(user);
    } else {
        var cuser: User | undefined = user
    }

    if (cuser && cuser.istel && pub.smsurl) {//使用验证码登陆
        var smurl = pub.smsurl + "&_t=1&callback=STK_" + new Date().getTime()
        let sendyzmd = await gongju.httpget(smurl, wbhead, jar)
        logger.info(sendyzmd);
        await fanqie_getzdmobile("11116", cuser.user)
        pass = await fanqie_getcodefor(cuser.user, "11116", 90)
        logger.info("收到验证码:" + pass);
        let sp = wbsso.sp(pub.pubkey, servertime, pub.nonce, pass);
        var wbfrom: any = {
            entry: "weibo",
            gateway: 1,
            from: "",
            savestate: 7,
            qrcode_flag: false,
            useticket: 1,
            pagerefer: "https://passport.weibo.com/visitor/visitor?entry=miniblog&a=enter&url=https%3A%2F%2Fweibo.com%2F&domain=.weibo.com&ua=php-sso_sdk_client-0.6.36&_rand=" + new Date().getTime(),
            cfrom: 1,
            vsnf: 1,
            su,
            service: "miniblog",
            servertime,
            nonce: pub.nonce,
            pwencode: "rsa2",
            rsakv: pub.rsakv,
            sp,
            sr: 1920 * 1080,
            encoding: " UTF-8",
            prelt: gongju.qqjsjs(1, 100),
            url: "https://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack",
            returntype: " META"
        }
    } else {
        let sp = wbsso.sp(pub.pubkey, servertime, pub.nonce, pass);
        var wbfrom: any = {
            entry: "weibo",
            gateway: 1,
            from: "",
            savestate: 7,
            qrcode_flag: false,
            useticket: 1,
            pagerefer: "https://passport.weibo.com/visitor/visitor?entry=miniblog&a=enter&url=https%3A%2F%2Fweibo.com%2F&domain=.weibo.com&ua=php-sso_sdk_client-0.6.36&_rand=" + new Date().getTime(),
            vsnf: 1,
            su,
            service: "miniblog",
            servertime,
            nonce: pub.nonce,
            pwencode: "rsa2",
            rsakv: pub.rsakv,
            sp,
            sr: 1920 * 1080,
            encoding: " UTF-8",
            prelt: gongju.qqjsjs(1, 100),
            url: "https://weibo.com/ajaxlogin.php?framelogin=1&callback=parent.sinaSSOController.feedBackUrlCallBack",
            returntype: " META"
        }
    }


    if (code && pub) {//添加验证码相关参数
        wbfrom.pcid = pub.pcid;
        wbfrom.door = code;
    }
    if (!proxy) {
        let ipport = await gethttpdl_one().catch();
        if (ipport) {
            proxy = util.format('http://%s:%s@%s:%d', "xxxxxxxx", "xxxxxxxxx", ipport.ip, ipport.port);
        }
    }
 
    let loginurl: string = await gongju.httppost("https://login.sina.com.cn/sso/login.php?client=ssologin.js(v1.4.19)", wbfrom, wbhead, jar, null, { proxy: proxy }).then((v) => {
        return new Promise((resolve, reject) => {
            if (v.statusCode == 200) {
                var body = iconv.decode(v.body, 'gb2312').toString(); //解码gb2312
                let u = gongju.qwbzj(body, 'location.replace("', '"')
                if (u) {
                    resolve(u)
                } else {
                    reject("")
                }
            } else {
                resolve("");
            }
        })
    })

    if (loginurl.indexOf("retcode=4049") != -1 || loginurl.indexOf("%CA%E4%C8%EB%B5%C4%D1%E9%D6%A4%C2%EB%B2%BB%D5%FD%C8%B7") != -1) {
        jc++;
        if (code && jc && jc >= 5) {
            return Promise.reject("验证码错误，且超过最大偿试次数");
        }
        let { body } = await gongju.httpget(`https://login.sina.com.cn/cgi/pin.php?r=${gongju.randnum(8)}&s=0&p=${pub.pcid}`, wbhead, jar, null).catch()
        fs.createWriteStream('aa.png').end(body);
        //let yzm = await inputyzm().catch()
        let yzm = await httpgetyzm(body).catch((err: any): string => { logger.warn(err); return "" });
        return login(user, pass, jar, yzm, jc, pub, proxy);
    } else if (loginurl.indexOf("retcode=101") != -1) {
        return Promise.reject("密码错误");
    } else if (!loginurl || loginurl.indexOf("crossdomain2.php") == -1) {
        return Promise.reject("登陆失败,未知错误:" + loginurl);
    }


    //console.log(jar.getCookieString("https://sina.com.cn")) ; 
    //console.log(jar.getCookieString("https://login.sina.com.cn"));
    var temp = await gongju.httpget(loginurl, wbhead, jar).catch()
    let ticket = gongju.qwbzj(temp.body, "?ticket=", '"');
    //console.log(ticket);
    temp = await gongju.httpget("https://passport.weibo.com/wbsso/login?ticket=" + ticket + "&callback=sinaSSOController.doCrossDomainCallBack&scriptId=ssoscript0&client=ssologin.js(v1.4.19)&_=" + new Date().getTime(), wbhead, jar).catch()
    try {
        //{"result":true,"userinfo":{"uniqueid":"1797403185","displayname":"\u6743\u5229\u6e38\u620f"}}
        let r = JSON.parse(gongju.qwbzj(temp.body, "CallBack(", ");"))
        r = { userinfo: { uniqueid: r.userinfo.uniqueid, nick: r.userinfo.displayname }, jar, user, clientId: await getchatclientld(jar).catch() };
        if(cuser && cuser.uid=="0"){
            cuser.uid=r.userinfo.uniqueid;
        }
        addluser(r);
        return r;
    } catch (err) {
        bugger.warn(err);
        return Promise.reject(err);
    }
}
async function getchatclientld(jar: any): Promise<string> {
    return gongju.httpget("https://web.im.weibo.com/im/handshake?jsonp=jQuery1124030479020287272207_" + new Date().getTime() + "&message=%5B%7B%22version%22%3A%221.0%22%2C%22minimumVersion%22%3A%221.0%22%2C%22channel%22%3A%22%2Fmeta%2Fhandshake%22%2C%22supportedConnectionTypes%22%3A%5B%22callback-polling%22%5D%2C%22advice%22%3A%7B%22timeout%22%3A60000%2C%22interval%22%3A0%7D%2C%22id%22%3A%222%22%7D%5D&_=" + new Date().getTime(), wbhead, jar).then((v) => {
        // console.log(v);
        return new Promise((resolve, reject) => {
            let clientId = gongju.qwbzj(v.body, 'clientId":"', '"')
            if (clientId) {
                resolve(clientId);
            } else {
                resolve("");
            }
        })
    })
}
/* async function getchatuid(jar:any):Promise<string>{//获取消息用户列表
    return  gongju.httpget("https://api.weibo.com/webim/2/direct_messages/contacts.json?special_source=3&add_virtual_user=3,4&is_include_group=0&need_back=0,0&count=50&source=209678993&t="+ new Date().getTime() ,wbhead,jar).then((v)=>{
        console.log(JSON.parse(v.body));
        return new Promise((resolve,reject)=>{
          resolve("");
        })
    })
} */

/**
 *发送消息 成功返回 t.cn链接，失败返回 0
 *
 * @param {(string | undefined)} uid
 * @param {*} jar
 * @param {string} content
 * @param {(string | undefined)} clientid
 * @returns {Promise<string>}
 */
async function sendmessg(uid: string | undefined, jar: any, content: string, clientid: string | undefined): Promise<string> {
    if (!uid) {
        return Promise.reject("0");
    }
    /*  if(content.indexOf("http")!=-1){
         content=encodeURI(content);
     } */
    content = content.replace(/!/g, "%21");
    content = content.replace(/-/g, "%2D");
    content = content.replace(/_/g, "%5F");
    let form: any = {
        text: content,
        uid,
        extensions: { "clientid": clientid },
        is_encoded: 0,
        decodetime: 1,
        source: 209678993
    }
    return gongju.httppost("https://api.weibo.com/webim/2/direct_messages/new.json", form, wbhead, jar, "utf-8", { json: true }).then((v) => {
        return new Promise((resolve, reject) => {
            if (v.body.url_objects && v.body.url_objects.length) {
                resolve(v.body.url_objects[0].url_ori);
            } else if (v.body.error) {// error: 'account is locked.'
                logger.info(v.body);
                resolve(v.body.error)
            } else if (v.body.created_at) {
                resolve("")
            } else {//发送失败
                logger.info(v.body);
                resolve("0");
            }
        })
    })
}
/* !-_
%21%2D%5F */

//"17061055301", "hl611574#"
//"799858521@qq.com", "528HUJUNNG#"
/*  let url = await sendmessg(v.userinfo.uniqueid, v.jar, "http://xid508.flbbb.store/h5/zzpage?xid=FMr4JfKX6C2f4DcPX0D30&name=%E5%B7%A8%E7%9C%81&pass=QMqt1pC1GIp&img=!HR0-HM6Ly9p_W-uYWxpY2RuLmNv_S9iYW8vdXBs_2FkZWQv!TEvMjIwMTE5OTQ1NjgxOS9PMUNOMDFQWGZLWjIyMEY5S3B1RkIzTl8hITAt!XRl_V9w!WMu!nBnXzYwMHg2MDA=&id=601149918971&fx=1", v.clientId)
 console.log(url); */

/**
 *获取一个代理IP 
 *使用快代理接口
 * @returns {(Promise<{ip:string,port:string}|undefined>)}
 */
async function gethttpdl_one(): Promise<{ ip: string, port: string } | undefined> {
    let ipport = await gongju.httpget("http://dps.kdlapi.com/api/getdps/?orderid=" + kuaidailiddbh + "&num=1&pt=1&dedup=1&sep=1").catch()
    if (ipport && ipport.body && ipport.body.length < 30) {
        logger.info("代理IP :" + ipport.body);
        let ab = ipport.body.split(":")
        if (ab.length == 2) {
            return { ip: ab[0], port: ab[1] };
        } else {
            return undefined
        }
    } else {
        return undefined
    }
}


/**
 *登陆所有帐号并开通权限  闭环激活模式
 *
 */
async function loginalluser() {
    let a = await readjsonfile("user.json").catch();//[{ "user": "17061055301", pass: "hl611574" }]
    if (a) {
        userlist = new Map(a);
    }
    let b = await readjsonfile("userlock.json").catch();//[{ "user": "17061055301", pass: "hl611574" }]
    if (b) {
        userlistlock = new Map(b);
    }

    let u = await readFileasync("user.txt", "utf-8").catch((err) => {
        console.log(err);
    })

    if (u) {
        u.split("\r\n").map((v: string) => {
            let b = v.split("----");
            if (b && b.length > 1) {
                if (!userlist.has(b[0])) {//不存在重复帐号
                    userlist.set(b[0], { user: b[0], pass: b[1] });
                }
            }
        })
    }
    let time = 1000//登陆间隔
    let cg: number = 0;
    let sb: number = 0;
    let lastuser: User | undefined
    let f = await UserMaptoarr(userlist).reduce(async (total: Promise<User> | undefined, cuser: User): Promise<User> => {
        // 首次调用  total为undefined ,cuser为第N个元素,n=1-userlist长度
        return new Promise((resolve, reject) => {
            if (cuser.type == "锁定") {
                logger.info(cuser.user + "已锁定的帐号，不在偿试登陆");
                resolve(cuser)
                return;
            }
            if (total) {
                total.finally(() => {
                    login(cuser.user, cuser.pass).then(async () => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        if (lastuser) {
                            await sendtestmessg(lastuser, cuser).catch()
                            lastuser = undefined;
                        }
                        if (!cuser.messguid) {//当前帐号还没有收消转链消息对象
                            lastuser = cuser;
                        }
                        resolve(cuser)
                    }).catch((err) => {
                        sb++;
                        logger.error(err)
                        resolve(cuser)
                    })
                })
            } else {
                login(cuser.user, cuser.pass).then(async () => {
                    if (lastuser) {
                        await sendtestmessg(lastuser, cuser).catch()
                        lastuser = undefined;
                    }
                    if (!cuser.messguid) {//当前帐号还没有收消转链消息对象
                        lastuser = cuser;
                    }
                    setTimeout(() => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        resolve(cuser)
                    }, time)
                }).catch((err) => {
                    sb++;
                    logger.error(err)
                    resolve(cuser)
                })
            }
        })
    }, undefined)?.catch()
    if (lastuser) {//使用头部帐号给尾部帐号激活权限 形成闭环
        let cuser = userlist.get(loginuser.entries().next().value[0]);//已登陆的头部帐号
        if (cuser) {
            await sendtestmessg(lastuser, cuser).catch()
        }
    }
    saveuserlist();
    logger.info(`登陆完成,成功:${cg},失败:${sb}`);
    fs.writeFile("user.txt", "", (err) => {
    });
}


/**
 *登陆所有帐号并开通权限  上下组合激活模式
 *
 */
async function loginalluser2() {
    let a = await readjsonfile("user.json").catch();//[{ "user": "17061055301", pass: "hl611574" }]
    if (a) {
        userlist = new Map(a);
    }
    let b = await readjsonfile("userlock.json").catch();//[{ "user": "17061055301", pass: "hl611574" }]
    if (b) {
        userlistlock = new Map(b);
    }
    let u = await readFileasync("user.txt", "utf-8").catch((err) => {
        console.log(err);
    })
    if (u) {
        u.split("\r\n").map((v: string) => {
            let b = v.split("----");
            if (b && b.length > 1) {
                if (!userlist.has(b[0])) {//不存在重复帐号
                    userlist.set(b[0], { user: b[0], pass: b[1], uid: b[2] });
                }
            }
        })
    }
    let time = 1000//登陆间隔
    let cg: number = 0;
    let sb: number = 0;

    let f = await UserMaptoarr(userlist).reduce(async (total: Promise<User> | undefined, cuser: User, cui: number, arr: User[]): Promise<User> => {
        // 首次调用  total为undefined ,cuser为第N个元素,n=1-userlist长度
        return new Promise((resolve, reject) => {
            if (cuser.type == "锁定") {
                logger.info(cuser.user + "已锁定的帐号，不在偿试登陆");
                resolve(cuser)
                return;
            }
            if (total) {
                total.finally(() => {
                    login(cuser.user, cuser.pass).then(async () => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        resolve(cuser)
                    }).catch((err) => {
                        sb++;
                        logger.error(err)
                        resolve(cuser)
                    })
                })
            } else {
                login(cuser.user, cuser.pass).then(async () => {
                    setTimeout(() => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        resolve(cuser)
                    }, time)
                }).catch((err) => {
                    sb++;
                    logger.error(err)
                    resolve(cuser)
                })
            }
        })
    }, undefined)?.catch()
    //给所有登陆帐号激活消息接收对象id

    let len = userlist.size;
    f = await LUserMaptoarr(loginuser).reduce(async (total: Promise<User> | undefined, cuser: User, cui: number, arr: User[]): Promise<User> => {
        return new Promise(async (resolve, reject) => {
            let broi;//配对帐号的下标
            if (total) {
                total.finally(async () => {//因为total是不承诺 需等到承诺完成后在执行下一步
                    if ((cui + 1) % 2 == 0) {//偶
                        broi = cui - 1
                    } else {
                        broi = cui + 1
                    }
                    if (broi < len && arr[broi] && !arr[broi].messguid) {//配对 帐号还没有激活消息id
                        await sendtestmessg(arr[broi], cuser).catch();
                        setTimeout(() => {
                            resolve(cuser)
                        }, 200)
                    } else {
                        resolve(cuser)
                    }
                })
            } else {
                if ((cui + 1) % 2 == 0) {//偶
                    broi = cui - 1
                } else {
                    broi = cui + 1
                }
                if (broi < len && arr[broi] && !arr[broi].messguid) {//配对 帐号还没有激活消息id
                    await sendtestmessg(arr[broi], cuser).catch();
                    setTimeout(() => {
                        resolve(cuser)
                    }, 200)
                } else {
                    resolve(cuser)
                }
            }
        })
    }, undefined)?.catch()
    saveuserlist();
    logger.info(`登陆完成,成功:${cg},失败:${sb}`);
    fs.writeFile("user.txt", "", (err) => {
    });
}


/**
 *登陆指定手机帐号组并开通权限  上下组合激活模式,登陆成功的帐号会添加到userlist和Luserlis
 *
 */
async function loginalluser_assign(usl: User[]) {
    let time = 1000//登陆间隔
    let cg: number = 0;
    let sb: number = 0;
    let lusr = new Map<string, Luser>();//所有登陆成功的帐号

    let f = await usl.reduce(async (total: Promise<User> | undefined, cuser: User, cui: number, arr: User[]): Promise<User> => {
        // 首次调用  total为undefined ,cuser为第N个元素,n=1-userlist长度
        return new Promise((resolve, reject) => {
            if (cuser.type == "锁定") {
                logger.info(cuser.user + "已锁定的帐号，不在偿试登陆");
                resolve(cuser)
                return;
            }
            if (total) {
                total.finally(() => {
                    login(cuser, "").then(async (lu) => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        lusr.set(cuser.user, lu)
                        resolve(cuser)
                    }).catch((err) => {
                        sb++;
                        logger.error(err)
                        resolve(cuser)
                    })
                })
            } else {
                login(cuser, "").then(async (lu) => {
                    setTimeout(() => {
                        cg++;
                        logger.info("登陆成功," + cuser.user)
                        lusr.set(cuser.user, lu)
                        resolve(cuser)
                    }, time)
                }).catch((err) => {
                    sb++;
                    logger.error(err)
                    resolve(cuser)
                })
            }
        })
    }, undefined)?.catch()
    //给所有登陆帐号激活消息接收对象id

    let len = usl.length;
    f = await LUserMaptoarr(lusr).reduce(async (total: Promise<User> | undefined, cuser: User, cui: number, arr: User[]): Promise<User> => {
        return new Promise(async (resolve, reject) => {
            let broi;//配对帐号的下标
            if (total) {
                total.finally(async () => {//因为total是不承诺 需等到承诺完成后在执行下一步
                    if ((cui + 1) % 2 == 0) {//偶
                        broi = cui - 1
                    } else {
                        broi = cui + 1
                    }
                    if (broi < len && arr[broi] && !arr[broi].messguid) {//配对 帐号还没有激活消息id
                        await sendteltestmessg(arr[broi], cuser, lusr).catch();
                        setTimeout(() => {
                            resolve(cuser)
                        }, 200)
                    } else {
                        resolve(cuser)
                    }
                })
            } else {
                if ((cui + 1) % 2 == 0) {//偶
                    broi = cui - 1
                } else {
                    broi = cui + 1
                }
                if (broi < len && arr[broi] && !arr[broi].messguid) {//配对 帐号还没有激活消息id
                    await sendteltestmessg(arr[broi], cuser, lusr).catch();
                    setTimeout(() => {
                        resolve(cuser)
                    }, 200)
                } else {
                    resolve(cuser)
                }
            }
        })
    }, undefined)?.catch()
    saveuserlist();
    logger.info(`登陆完成,成功:${cg},失败:${sb}`);
}

/* testtcn.on("tcn", async function (url: string) {
    let u = tcniterator.next()
    if (u.done) {//迭代结束
        tcniterator = loginuser.entries();//重新迭代
        u = tcniterator.next()
    }
    let r: Luser = u.value[1]
    let allerr = false;
    while (userlist.get(r.user)?.type == "异常") {
        u = tcniterator.next()
        if (!u.done) {
            r = u.value[1];
        } else {
            if (allerr) {
                return "所有帐号异常，需发送事件通知"  //TODO:当前程序直接返回了
            }
            tcniterator = loginuser.entries();//重新迭代
            allerr = true;
        }
    }
    let tcn: string = await sendmessg(userlist.get(r.user)?.messguid, r.jar, url, r.clientId)
    logger.info(tcn);
}) */


/**
 *迭代获取下一个可用帐号
 *
 * @returns {(Luser|undefined)}
 */
function getnextuser(): Luser | undefined {
    if (loginuser.size <= 3) {
        console.log("还未就绪")
        return undefined;
    } else if (!tcniterator || !tcniterator.next) {
        tcniterator = loginuser.entries();
    }

    let u = tcniterator.next();
    if (u.done) {//迭代结束
        tcniterator = loginuser.entries();//重新迭代
        u = tcniterator.next()
    }
    let r: Luser = u.value[1]
    let allerr = false;
    let iserr = false;
    if (r.lxsb && r.lxsb > 5) {
        iserr = true;//无效帐号
    }
    if (typeof r.user == "string") {
        var cuser = userlist.get(r.user);
    } else {
        var cuser: User | undefined = r.user;
    }


    while (cuser?.type != undefined || !cuser?.messguid || iserr) {//过滤type 不为空 或 出现错误的帐号 或不存在消息接收对象
        u = tcniterator.next();
        iserr = false;
        if (!u.done) {
            r = u.value[1];
        } else {
            if (allerr) {
                logger.error("所有帐号异常，需发送事件通知");
                pdcloud.notification.info("所有dwz帐号异常");
                return undefined
            }
            tcniterator = loginuser.entries();//重新迭代 
            allerr = true;
            u = tcniterator.next();
            r = u.value[1];
        }

        if (typeof r.user == "string") {
            cuser = userlist.get(r.user);
        } else {
            cuser = r.user;
        }


        if (cuser && cuser.error && cuser.succeed) {
            if (cuser.error > cuser.succeed && cuser.error > 20) {
                iserr = true;//无效帐号
            }
        }
        if (r.lxsb && r.lxsb > 5) {
            iserr = true;//无效帐号
        }
    }
    return r;
}


function UserMaptoarr(Ul: Map<string, User>): User[] {//userlist map类型的值转一维数组
    let u: User[] = [];
    Ul.forEach((v, k) => {
        u.push(v);
    })
    return u;
}

function LUserMaptoarr(Ul: Map<string, Luser>): User[] {//loginuser map类型的值转一维数组
    let u: User[] = [];
    Ul.forEach((v, k) => {
        let a = userlist.get(k);
        if (a) {
            u.push(a);
        }
    })
    return u;
}

function addluser(v: any) {
    saveuserlist();
    loginuser.set(v.user, v);
}

/**
 *保存帐号map,过滤掉锁定帐号并另外保存, 过滤失败次数>20,且大于成功次数的帐号,或连续失败5次的帐号
 *
 */
async function saveuserlist() {//
    console.log("保存帐号")
    let lf = false;
    let newl = [...userlist].filter((x) => { //type":"锁定
        let lusr = loginuser.get(x[0]);
        let succeedjc = x[1].succeed || 0;

        console.log(x[1].error, succeedjc)
        if (lusr && lusr.lxsb && lusr.lxsb > 5) {//连续失败5次的帐号
            if (!userlistlock.has(x[0])) {
                userlistlock.set(x[0], x[1]);
                lf = true;
            }
            return false
        } else if (x[1].error && x[1].error > 20 && x[1].error > succeedjc) {//过滤失败次数>20,且大于成功次数的帐号
            if (!userlistlock.has(x[0])) {
                userlistlock.set(x[0], x[1]);
                lf = true;
            }
            return false
        } else if (x[1].type == "登陆失效") {
            return true
        } else if (!x[1].type) {
            return true
        } else {
            if (!userlistlock.has(x[0])) {
                userlistlock.set(x[0], x[1]);
                lf = true;
            }
            return false;
        }
    })


    let t = JSON.stringify(newl);
    fs.writeFile("user.json", t, (err) => {

    });
    if (lf) {
        let tt = JSON.stringify(Array.from(userlistlock))
        fs.writeFile("userlock.json", tt, (err) => {

        });
    }
}

/**
 *发送试探消息开通权限 
 *
 * @param {User} lastuser 接收消息的帐号
 * @param {User} cuser 发送消息的帐号
 * @param {jar} jar 传入时 则直接使用此cookie jar
 */
async function sendtestmessg(lastuser: User, cuser: User, jar?: request.CookieJar) {//
    let content = getrandword();
    let r = await sendmessg(loginuser.get(lastuser.user)?.userinfo.uniqueid, jar || loginuser.get(cuser.user)?.jar, content, loginuser.get(cuser.user)?.clientId).catch()
    if (r == "account is locked.") {//帐号被锁定
        cuser.type = "锁定"
        logger.info(cuser.user + "已锁定," + content);
    } else if (r !== "0") {//消息发送成功
        let lu = userlist.get(lastuser.user);
        if (lu) {
            logger.info(cuser.user + "发送消息正常");
            lu.messguid = loginuser.get(cuser.user)?.userinfo.uniqueid
        }
    } else {
        logger.info(cuser.user + "发送消息失败");
    }
}

/**
 *发送试探消息开通权限 2
 *
 * @param {User} lastuser 接收消息的帐号
 * @param {User} cuser 发送消息的帐号
 * @param {jar} jar 传入时 则直接使用此cookie jar
 */
async function sendteltestmessg(lastuser: User, cuser: User, luser: Map<string, Luser>) {//
    let content = getrandword();
    let r = await sendmessg(luser.get(lastuser.user)?.userinfo.uniqueid, luser.get(cuser.user)?.jar, content, luser.get(cuser.user)?.clientId).catch()
    if (r == "account is locked.") {//帐号被锁定
        cuser.type = "锁定"
        logger.info(cuser.user + "已锁定," + content);
    } else if (r !== "0") {//消息发送成功
        let lu = lastuser
        if (lu) {
            logger.info(cuser.user + "发送消息正常");
            lu.messguid = luser.get(cuser.user)?.userinfo.uniqueid
        }
    } else {
        logger.info(cuser.user + "发送消息失败");
    }
}

/**
 *发送测试消息判断是否锁定
 *
 * @param {string} recuid
 * @param {User} cuser
 * @param {request.CookieJar} jar
 */
async function sendtestmessg2(recuid: string, cuser: User, jar: request.CookieJar, clientId: string) {//
    let r = await sendmessg(recuid, jar, getrandword(), clientId).catch()
    if (r == "account is locked.") {//帐号被锁定
        cuser.type = "锁定"
        logger.info(cuser.user + "已锁定");
        return "no"
    } else if (r == " out of limit!") {
        cuser.type = "异常"
        logger.info(cuser.user + "消息发送异常，待重新激活");
        return "no"
    } else if (r == "User does not exists!") {
        cuser.type = "messguid异常"
        logger.info(cuser.user + ",messguid异常，待重新绑定");
        return "no"
    } else if (r !== "0") {//消息发送成功
        console.log(r);
        return "ok"
    }
}


/**
 *手动输入验证码
 *
 * @returns {Promise<string>}
 */
async function inputyzm(): Promise<string> {
    return new Promise((resolve, reject) => {
        process.stdin.resume();
        process.stdout.write('请输入验证码: ');
        let yzm = ""
        process.stdin.on("data", (v) => {
            yzm = v.toString();
            yzm = yzm.replace("\r\n", "")
            resolve(yzm);
            process.stdin.pause();
        })
    })
}


/**
 *读json文件
 *
 * @param {string} path
 * @returns {(Promise<Apinode|undefined>)}
 */
async function readjsonfile(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
        readFileasync(path, "utf-8").then((data: any) => {
            try {
                let b = JSON.parse(data);
                resolve(b);
            } catch (err) {
                console.log(err);
                resolve(undefined);
            }
        }).catch((err: any) => {
            resolve(undefined);
        });
    });
}


/**
 *取随机句子
 *
 * @returns {string}
 */
function getrandword(): string {
    let i = gongju.qqjsjs(0, 99);
    return randword[i];
}

/**
 *在线本地识别验证码
 *
 * @param {Buffer} buf
 */
async function httpgetyzm(buf: Buffer): Promise<string> {
    let formdata = {
        img: buf,
        apikey: "AAAAAAAAAAAKCAOIE"
    }
    let { body } = await gongju.httppostform("http://127.0.0.1:38952/ocr", formdata).catch((err) => {
        logger.error(err);
    })
    logger.info(body);
    return body;
}


function toyb<T, U = any>(//https://www.jianshu.com/p/2935c0330dd2
    promise: Promise<T>,
    errorExt?: object
): Promise<[U | null, T | undefined]> {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, undefined]>(err => {
            if (errorExt) {
                Object.assign(err, errorExt)
            }
            return [err, undefined]
        })
}



let randword = ["最灵繁的人也看不见自己的背脊。", "最困难的事情就是认识自己。", "有勇气承担命运这才是英雄好汉。", "与肝胆人共事，无字句处读书。", "阅读使人充实，会谈使人敏捷，写作使人精确。", "最大的骄傲于最大的自卑都表示心灵的最软弱无力。", "自知之明是最难得的知识。", "勇气通往天堂，怯懦通往地狱。", "有时候读书是一种巧妙地避开思考的方法。", "阅读一切好书如同和过去最杰出的人谈话。", "越是没有本领的就越加自命不凡。", "越是无能的人，越喜欢挑剔别人的错儿。", "知人者智，自知者明。胜人者有力，自胜者强。", "意志坚强的人能把世界放在手中像泥块一样任意揉捏。", "最具挑战性的挑战莫过于提升自我。", "业余生活要有意义，不要越轨。", "一个人即使已登上顶峰，也仍要自强不息。", "最大的挑战和突破在于用人，而用人最大的突破在于信任人。", "自己活着，就是为了使别人过得更美好。", "要掌握书，莫被书掌握；要为生而读，莫为读而生。", "要知道对好事的称颂过于夸大，也会招来人们的反感轻蔑和嫉妒。", "业精于勤，荒于嬉；行成于思，毁于随。", "一切节省，归根到底都归结为时间的节省。", "意志命运往往背道而驰，决心到最后会全部推倒。", "学习是劳动，是充满思想的劳动。", "要使整个人生都过得舒适、愉快，这是不可能的，因为人类必须具备一种能应付逆境的态度。", "只有把抱怨环境的心情，化为上进的力量，才是成功的保证。", "知之者不如好之者，好之者不如乐之者。", "勇猛、大胆和坚定的决心能够抵得上武器的精良。", "意志是一个强壮的盲人，倚靠在明眼的跛子肩上。", "只有永远躺在泥坑里的人，才不会再掉进坑里。", "希望的灯一旦熄灭，生活刹那间变成了一片黑暗。", "希望是人生的乳母。", "形成天才的决定因素应该是勤奋。", "学到很多东西的诀窍，就是一下子不要学很多。", "自己的鞋子，自己知道紧在哪里。", "我们唯一不会改正的缺点是软弱。", "我这个人走得很慢，但是我从不后退。", "勿问成功的秘诀为何，且尽全力做你应该做的事吧。", "学而不思则罔，思而不学则殆。", "学问是异常珍贵的东西，从任何源泉吸收都不可耻。", "只有在人群中间，才能认识自己。", "重复别人所说的话，只需要教育；而要挑战别人所说的话，则需要头脑。", "卓越的人一大优点是：在不利与艰难的遭遇里百折不饶。", "自己的饭量自己知道。", "我们若已接受最坏的，就再没有什么损失。", "书到用时方恨少、事非经过不知难。", "书籍把我们引入最美好的社会，使我们认识各个时代的伟大智者。", "熟读唐诗三百首，不会作诗也会吟。", "谁和我一样用功，谁就会和我一样成功。", "天下之事常成于困约，而败于奢靡。", "生命不等于是呼吸，生命是活动。", "伟大的事业，需要决心，能力，组织和责任感。", "唯书籍不朽。", "为中华之崛起而读书。", "书不仅是生活，而且是现在、过去和未来文化生活的源泉。", "生命不可能有两次，但许多人连一次也不善于度过。", "问渠哪得清如许，为有源头活水来。", "我的努力求学没有得到别的好处，只不过是愈来愈发觉自己的无知。", "生活的道路一旦选定，就要勇敢地走到底，决不回头。", "奢侈是舒适的，否则就不是奢侈。", "少而好学，如日出之阳；壮而好学，如日中之光；志而好学，如炳烛之光。", "三军可夺帅也，匹夫不可夺志也。", "人生就是学校。在那里，与其说好的教师是幸福，不如说好的教师是不幸。", "接受挑战，就可以享受胜利的喜悦。", "节制使快乐增加并使享受加强。", "今天应做的事没有做，明天再早也是耽误了。", "决定一个人的一生，以及整个命运的，只是一瞬之间。", "懒人无法享受休息之乐。", "浪费时间是一桩大罪过。", "既然我已经踏上这条道路，那么，任何东西都不应妨碍我沿着这条路走下去。", "家庭成为快乐的种子在外也不致成为障碍物但在旅行之际却是夜间的伴侣。", "坚持意志伟大的事业需要始终不渝的精神。", "路漫漫其修道远，吾将上下而求索。", "内外相应，言行相称。", "你热爱生命吗？那么别浪费时间，因为时间是组成生命的材料。", "坚强的信心，能使平凡的人做出惊人的事业。", "读一切好书，就是和许多高尚的人谈话。", "读书有三到，谓心到，眼到，口到。", "读书之法，在循序而渐进，熟读而精思。", "对一个人来说，所期望的不是别的，而仅仅是他能全力以赴和献身于一种美好事业。", "敢于浪费哪怕一个钟头时间的人，说明他还不懂得珍惜生命的全部价值。", "感激每一个新的挑战，因为它会锻造你的意志和品格。", "共同的事业，共同的斗争，可以使人们产生忍受一切的力量。", "古之立大事者，不惟有超世之才，亦必有坚忍不拔之志。", "故立志者，为学之心也；为学者，立志之事也。", "读一本好书，就如同和一个高尚的人在交谈。", "过去一切时代的精华尽在书中。", "好的书籍是最贵重的珍宝。", "读书是易事，思索是难事，但两者缺一，便全无用处。", "读书是在别人思想的帮助下，建立起自己的思想。", "合理安排时间，就等于节约时间。", "你想成为幸福的人吗？但愿你首先学会吃得起苦。", "抛弃时间的人，时间也抛弃他。", "普通人只想到如何度过时间，有才能的人设法利用时间。", "读书破万卷，下笔如有神。", "取得成就时坚持不懈，要比遭到失败时顽强不屈更重要。", "人的一生是短的，但如果卑劣地过这一生，就太长了。", "读书忌死读，死读钻牛角。", "不要回避苦恼和困难，挺起身来向它挑战，进而克服它。"]


//console.log(loginadduser({"user":"15685602302","pass":"sp278256","messguid":"7408932877"})) 

async function chilcklogin(jar: request.CookieJar): Promise<string> {
    let uiid = await gongju.httpget("https://weibo.com/", wbhead, jar, null).then(async (v): Promise<string> => {
        return new Promise(async (resolve, reject) => {
            v.body = iconv.decode(v.body, 'gb2312').toString(); //解码gb2312
            if (v.body.indexOf("https://passport.weibo.com/wbsso/login?ssosavestate") != -1 && v.body.indexOf("&ticket=") != -1) {
                let loginurl = gongju.qwbzj(v.body, 'location.replace("', '"');
                var temp = await gongju.httpget(loginurl, wbhead, jar).catch()
                var uid = gongju.qwbzj(temp.body, "$CONFIG['uid']='", "';")
                var nick = gongju.qwbzj(temp.body, "$CONFIG['nick']='", "';")
                if (uid && uid.length < 20) {//续期cookie成功
                    logger.info("续期cookie成功")
                    resolve(uid);
                } else {
                    resolve("0")
                }
            } else if (v.body.indexOf('location.replace("') != -1) {//待处理的未知情况
                let loginurl = gongju.qwbzj(v.body, 'location.replace("', '"');
                var temp = await gongju.httpget(loginurl, wbhead, jar, null).catch()
                temp.body = iconv.decode(temp.body, 'gb2312').toString(); //解码gb2312
                var uid = gongju.qwbzj(temp.body, "$CONFIG['uid']='", "';")
                var nick = gongju.qwbzj(temp.body, "$CONFIG['nick']='", "';")
                if (uid && uid.length < 20) {//续期cookie成功
                    logger.info("续期cookie成功a")
                    resolve(uid);
                } else {
                    logger.info(temp.body);
                    logger.info("续期,待处理的未知情况")
                    resolve("0")
                }
            } else {
                var uid = gongju.qwbzj(v.body, "$CONFIG['uid']='", "';")
                if (uid && uid.length < 20) {//cookie正常
                    logger.info("cookie正常")
                    resolve(uid);
                } else {
                    resolve("0")
                }
            }
        })
    })
    if (uiid) {
        return uiid;
    } else {
        return "0";
    }
}

/**
 *检查所有登陆已退出帐号
 *
 * @param {Luser} r
 */
async function chick_outuser_all() {
    // cuser.type = "登陆失效"
    let alluser = loginuser.entries();
    logger.info("开始检查登陆失效帐号")
    let next = function () {
        let u = alluser.next()
        if (!u.done) {
            let r: Luser = u.value[1];
            if (typeof r.user == "string") {
                var usr = userlist.get(r.user)
            } else {
                var usr: User | undefined = r.user
            }
            if (usr?.type == "登陆失效") {
                let cuser = usr;
                if (cuser) {
                    login(cuser.user, cuser.pass, r.jar).finally(() => {
                        next()
                    })
                } else {
                    next()
                }
            } else {
                next()
            }
        } else {
            logger.info("检查登陆失效帐号完成")
        }
    }
    next();
}

/* 
主动删除cookie有效记录，触发续期
let jart=request.jar(new FileCookieStore( __dirname + "/../jar/" + "17054522287" + ".json"));
delete jart["_jar"].store.idx["weibo.com"]["/"]["SUB"]
delete jart["_jar"].store.idx["weibo.com"]["/"]["Ugrow-G0"]
delete jart["_jar"].store.idx["weibo.com"]["/"]["YF-V5-G0"] 
chilcklogin(jart).then((v)=>{
     console.log(v);
})
*/





/**
 *cookie续期
 *
 */
async function updatecookieall() {
    logger.info("开始cookie续期")
    let alluser = loginuser.entries();
    let next = function () {
        let u = alluser.next()
        if (!u.done) {
            let r: Luser = u.value[1];
            if (!userlistlock.has(u.value[0])) {//不在锁定帐号名单中
                chilcklogin(r.jar).finally(() => {
                    next()
                })
            } else {
                next()
            }
        } else {
            logger.info("cookie续期完成")
        }
    }
    next();
}

async function test() {
    let tcn: string = await sendmessg(undefined, "aaa", "url", "clientId").catch((err): any => {
        return "akdjgoiasdoig"
    })
    console.log(tcn);
}

if (!cluster.isMaster || process.env.NODE_ENV == "test") {//如果是工作进程 或开发测试模式
    console.log("工作进程");

    //init_fanqie();
 
/*   loginalluser2().then(() => {
      
    }) */


}





