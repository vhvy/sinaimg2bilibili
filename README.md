## 批量迁移博客文章中的微博图片到B站/SM.MS

扫描博客文章，并匹配微博图片链接，然后批量上传到B站或者SM.MS。

### 使用

首先`npm i `安装依赖，其实也就是用到了`form-data`这个包。 

虽然`Node.js 18`原生支持了`FormData`，但是原生的`FormData`我折腾了半天也没能传上去，所以还是用这个包吧。

然后在`config.js`里面配置`postDir`路径，其实也就是存放`md`文件的路径，`Windows`平台记得路径用双反斜线`\\`。

### B站

配置`config.js`里面的`cookie`和`csrf`选项，`cookie`随便从B站网页接口上复制一条就行了，至于`csrf`则填写`cookie`中的`bili_jct`值。

### SM.MS

配置`config.js`里面的`smmsToken`选项，`token`在 [sm.ms](sm.ms) 个人中心中自行获取。

然后将`index.js`文件中调用到`uploadImgToBili`方法的地方替换成`uploadImgToSMMS`即可。

### 其他

B站接口调用太快会412，所以我加了个等待3秒，毕竟我图片不多，挂几分钟就传完了。