import fs from 'fs';
import https from "https";
import XormData from "form-data";
import config from "./config.js";


export const uploadImgToSMMS = (path) => {
    return new Promise((resolve, reject) => {
        const form = new XormData();

        const file = fs.createReadStream(path);

        form.append('smfile', file);

        const request = https.request({
            method: "POST",
            host: "sm.ms",
            path: "/api/v2/upload",
            headers: {
                Authorization: config.smmsToken,
                ...form.getHeaders()
            },

        }, (res) => {
            let content = "";
            res.on("data", chnk => {
                content += chnk;
            });

            res.on("end", () => {
                const result = JSON.parse(content);
                console.log(result);
                if (result.code === "success") {
                    resolve(result.data.url);
                } else if (result.code === "image_repeated") {
                    resolve(result.images);
                } else {
                    reject();
                }
            });
        });

        form.pipe(request);
    });
}