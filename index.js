import fs from "fs/promises";
import path from "path";
import https from "https";
import config from "./config.js";
import { uploadImgToBili } from "./bilibili.js";
import { uploadImgToSMMS } from "./smms.js";

const posts = await fs.readdir(config.postDir);

const imgTmpPath = path.resolve("./images");

const sinaRegexp = /https:\/\/.+?\.sinaimg.cn\/.+?(jpg|gif)/gi;

try {
    await fs.access(imgTmpPath);
} catch (err) {
    console.log("图片缓存文件夹不存在，已创建!");
    await fs.mkdir(imgTmpPath);
}

const sleep = (delay = 3000) => {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}



const downloadImg = (imgPath) => {
    return new Promise(async (resolve) => {
        const imageName = path.parse(imgPath).base;

        https.get(imgPath, {
            'headers': {
                referer: "https://weibo.com/"
            },
        }, res => {
            let content = '';

            res.setEncoding("binary");

            res.on("data", (chunk) => {
                content += chunk;
            });

            res.on("end", async () => {
                const savePath = path.resolve(imgTmpPath, imageName);

                await fs.writeFile(savePath, content, "binary")
                resolve(savePath);
            });

        })
    });
}

for (let post of posts) {
    if (path.extname(post) !== ".md") continue;
    const mdPath = path.resolve(config.postDir, post);
    let content = await fs.readFile(mdPath, {
        encoding: "utf8"
    });

    const matchResult = content.match(sinaRegexp);
    if (!matchResult || !matchResult.length) continue;


    console.log("正在下载文章 %s 中的图片...", post)
    const downloadSinaImgTasks = matchResult.map(url => downloadImg(url));
    const imgPathList = await Promise.all(downloadSinaImgTasks);

    console.log("正在上传文章 %s 中的图片到B站...", post)
    // const uploadTasks = imgPathList.map(path => uploadImgToBili(path));
    // const biliImgList = await Promise.all(uploadTasks);
    // 上传太快了，b站接口直接412了，还是改成下面这样稳一点慢慢传吧。

    const biliImgList = [];

    for (let path of imgPathList) {
        const biliImgUrl = await uploadImgToBili(path);
        biliImgList.push(biliImgUrl);
        await sleep();
    }

    //////

    matchResult.forEach((sinaImgSrc, index) => {
        content = content.replace(sinaImgSrc, biliImgList[index]);
    });

    console.log("正在写入硬盘...")
    await fs.writeFile(mdPath, content, {
        encoding: "utf8"
    })
    console.log("写入完成!");
    console.log("--------------------------");
}