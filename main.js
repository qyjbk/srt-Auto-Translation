const fs = require('fs');
const path = require('path');
const axios = require('axios');
const CryptoJS = require('crypto-js');

// 指定目录路径
const directoryPath = './srt';

// 有道api需要的常量
// 此处需要将appKey和Key改为自己的，否则无法使用
const appKey = '1234567890';
const key = '123';//注意：暴露appSecret，有被盗用造成损失的风险
const from = 'en';
const to = 'zh-CHS';
function truncate(q) {
    const len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
}

// 获取翻译的函数，接受需要翻译的句子，返回一个axios的promise
// 此处以有道翻译api示例，可以改写为其他api，需参数和返回值类型相同。
function getTranslation(query) {
    const salt = (new Date).getTime();
    const curtime = Math.round(new Date().getTime() / 1000);
    const str1 = appKey + truncate(query) + salt + curtime + key;
    const sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);

    return axios.get('https://openapi.youdao.com/api', {
        params: {
            q: query,
            appKey: appKey,
            salt: salt,
            from: from,
            to: to,
            sign: sign,
            signType: "v3",
            curtime: curtime,
        }
    })
}

// 封装的函数
// 接受srt文件路径数组，逐文件的解析
async function promiseArr(arr) {
    for (let x = 0; x < arr.length; x++) {
        // promise数组
        const promiseArray = []
        const filePath = path.join(directoryPath, arr[x]);
        const npse = new Promise((res, rej) => {
            fs.readFile(filePath, 'utf8', async (err, data) => {
                if (err) {
                    console.log('无法读取文件:', file, err);
                    return;
                }
                // 正则匹配data中的英文部分，此正则有缺陷，仅测试了本人需要翻译的srt文件无bug
                const regex = /(?<=\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}[\n\s\r]*)[0-9A-Za-z\n\s\r>'"%,.!?\(\)\/-]*((?<=[a-z\s]):[0-9A-Za-z\n\s\r>'"%,.!?\(\)\/-]*)*[A-Za-z,.!?-]/g;
                const matches = [...data.matchAll(regex)];
                const paragraphs = matches.map(match => match[0].replace(/[\n\r\s]/g, ' ').replace(/ +/g, ' '));
                console.log(paragraphs.length);
                console.log(paragraphs);
                // 逐行翻译
                let i = 0;
                const my = new Promise((res1) => {
                    const timerId = setInterval(() => {
                        // 在这里编写定时执行的代码
                        const query = paragraphs[i];
                        const translationPromise = getTranslation(query)
                        // translation期约完成时改写读取的data数据
                        translationPromise.then((res) => {
                            // console.log(data)
                            console.log(`文件 ${ filePath } 翻译中,进度： ${ i } / ${paragraphs.length} `)
                            try {
                                if (res.data.translation[0]) {
                                    data = data.replace(matches[i - 1][0], '\n' + res.data.translation[0])
                                }
                            } catch (e) {
                                console.log('由于您翻译软件返回的响应有问题，请检测翻译接口返回的状态码')
                                // 如果返回的状态码表示访问的频率过高，请调低定时器的轮询时间
                                //    有道翻译异常解开此检测状态码
                                   console.log(res.data)
                            }
                        })

                        i += 1;
                        // 将翻译请求promise压入promise数组中
                        promiseArray.push(translationPromise)

                        // 在翻译文本循环终点时关闭定时器
                        // 因为有道的翻译api有频率限制，定在1.5秒请求一次,这个部分是最影响脚本运行的部分，
                        // 富哥可以考虑升级api以提高请求频率，调整定时器时间，加快脚本运行速度
                        if (i >= paragraphs.length) {
                            // 清除定时器，节约性能
                            clearInterval(timerId);
                            // 当全部翻译期约运行完时写入srt文件
                            Promise.all(promiseArray).then(() => {
                                // 文件保存格式：
                                // 源文件：文件名.srt
                                // 翻译后文件：文件名_zh.srt
                                fs.writeFile(filePath.replace(/\.srt$/, '_zh.srt'), data, 'utf8', (err) => {
                                    if (err) {
                                        console.error(err);
                                        return;
                                    }
                                    console.log(`文件保存成功！总翻译进度 ${x + 1} / ${arr.length}`);
                                });
                            })
                            res('succ')
                            res1('succ')
                        }
                    }, 1500);
                })
                await my;
            })
        })
        await npse;

    }
}

function getSRTdirname(dirpath) {
    return new Promise((resolve, reject) => {
      fs.readdir(dirpath, (err, files) => {
        if (err) {
          console.log('无法读取目录:', err);
          reject(err);
          return;
        }
        
        // 过滤出SRT文件
        let dirnameArr = files.filter(file => path.extname(file).toLowerCase() === '.srt');
        dirnameArr = dirnameArr.filter(file => !file.endsWith('_zh.srt'));
        resolve(dirnameArr);
      });
    });
  }

// main
getSRTdirname(directoryPath)
    .then(dirnameArr => {
        promiseArr(dirnameArr)
    })
    .catch(err => {
        console.error('发生错误:', err);
    });
