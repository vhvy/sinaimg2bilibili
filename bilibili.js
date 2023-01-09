import fs from "fs";
import config from "./config.js";
import https from "https";
import XormData from "form-data";

export const uploadImgToBili = async (filePath) => {
    const formData = new XormData();

    formData.append("file_up", fs.createReadStream(filePath));
    formData.append("biz", "new_dyn");
    formData.append("category", "daily");
    formData.append("csrf", config.csrf);


    return new Promise((resolve) => {
        const request = https.request({
            method: "post",
            host: "api.bilibili.com",
            path: "/x/dynamic/feed/draw/upload_bfs",
            headers: {
                referer: "https://t.bilibili.com/",
                cookie: config.cookie,
                ...formData.getHeaders()
            },


        }, (res) => {
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                const result = JSON.parse(body);
                result.data.image_url = result.data.image_url.replace("http:", "https:");
                resolve(result.data.image_url);
            });
        });

        formData.pipe(request);
    });
}