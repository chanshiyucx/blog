# nginx gzip 压缩

> 本文为个人学习摘要笔记。  
> 原文地址：[Nginx 优化静态文件访问](https://www.cnblogs.com/xueweihan/p/7082832.html)

Web 开发中需要的静态文件有：CSS、JS、字体、图片，可以通过 web 框架进行访问，但是效率不是最优的。
Nginx 对于处理静态文件的效率要远高于 Web 框架，因为可以使用 gzip 压缩协议，减小静态文件的体积加快静态文件的加载速度、开启缓存和超时时间减少请求静态文件次数。下面就介绍如何通过 Nginx 管理静态文件的访问，优化网站的访问速度。

## 开启 gzip

配置介绍和参数如下，建议使用时删掉注释。

```sh
gzip on;
#该指令用于开启或关闭gzip模块(on/off)

gzip_buffers 16 8k;
#设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。16 8k代表以8k为单位，安装原始数据大小以8k为单位的16倍申请内存

gzip_comp_level 6;
#gzip压缩比，数值范围是1-9，1压缩比最小但处理速度最快，9压缩比最大但处理速度最慢

gzip_http_version 1.1;
#识别http的协议版本

gzip_min_length 256;
#设置允许压缩的页面最小字节数，页面字节数从header头得content-length中进行获取。默认值是0，不管页面多大都压缩。这里我设置了为256

gzip_proxied any;
#这里设置无论header头是怎么样，都是无条件启用压缩

gzip_vary on;
#在http header中添加Vary: Accept-Encoding ,给代理服务器用的

gzip_types
    text/xml application/xml application/atom+xml application/rss+xml application/xhtml+xml image/svg+xml
    text/javascript application/javascript application/x-javascript
    text/x-json application/json application/x-web-app-manifest+json
    text/css text/plain text/x-component
    font/opentype font/ttf application/x-font-ttf application/vnd.ms-fontobject
    image/x-icon;
#进行压缩的文件类型,这里特别添加了对字体的文件类型

gzip_disable "MSIE [1-6]\.(?!.*SV1)";
#禁用IE 6 gzip
```

完整示例：

```conf
gzip on;
gzip_buffers 16 8k;
gzip_comp_level 6;
gzip_http_version 1.1;
gzip_min_length 256;
gzip_proxied any;
gzip_vary on;
gzip_disable "MSIE [1-6]\.(?!.*SV1)";
gzip_types
    text/xml application/xml application/atom+xml application/rss+xml application/xhtml+xml image/svg+xml image/jpeg image/png
    text/javascript application/javascript application/x-javascript
    text/x-json application/json application/x-web-app-manifest+json
    text/css text/plain text/x-component
    font/opentype font/ttf application/x-font-ttf application/vnd.ms-fontobject
    image/x-icon;
```

简化版：

```conf
gzip on;
gzip_buffers 16 8k;
gzip_comp_level 6;
gzip_http_version 1.1;
gzip_min_length 1k;
gzip_proxied any;
gzip_vary on;
gzip_disable "MSIE [1-6]";
gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png application/javascript;
```

## 扩展压缩类型

修改 `/etc/nginx/mime.types` 文件，增加需要压缩的文件对应 type 到上述 gzip 配置中。下面几乎涵盖了所有静态文件对应的类型：

```conf
types {
    application/atom+xml                atom;
    application/dart                    dart;
    application/gzip                    gz;
    application/java-archive            jar war ear;
    application/javascript              js jsonp;
    application/json                    json;
    application/owl+xml                 owl owx;
    application/pdf                     pdf;
    application/postscript              ai eps ps;
    application/rdf+xml                 rdf;
    application/rss+xml                 rss;
    application/vnd.ms-fontobject       eot;
    application/x-7z-compressed         7z;
    application/x-bittorrent            torrent;
    application/x-chrome-extension      crx;
    application/x-font-otf              otf;
    application/x-font-ttf              ttc ttf;
    application/x-font-woff             woff;
    application/x-opera-extension       oex;
    application/x-rar-compressed        rar;
    application/x-shockwave-flash       swf;
    application/x-web-app-manifest+json webapp;
    application/x-x509-ca-cert          crt der pem;
    application/x-xpinstall             xpi;
    application/xhtml+xml               xhtml;
    application/xml                     xml;
    application/xml-dtd                 dtd;
    application/zip                     zip;

    audio/midi                          kar mid midi;
    audio/mp4                           aac f4a f4b m4a;
    audio/mpeg                          mp3;
    audio/ogg                           oga ogg;
    audio/vnd.wave                      wav;
    audio/x-flac                        flac;
    audio/x-realaudio                   ra;

    image/bmp                           bmp;
    image/gif                           gif;
    image/jpeg                          jpe jpeg jpg;
    image/png                           png;
    image/svg+xml                       svg svgz;
    image/tiff                          tif tiff;
    image/webp                          webp;
    image/x-icon                        cur ico;

    text/cache-manifest                 appcache manifest;
    text/css                            css less;
    text/csv                            csv;
    text/html                           htm html shtml;
    text/mathml                         mml;
    text/plain                          txt;
    text/rtf                            rtf;
    text/vcard                          vcf;
    text/vtt                            vtt;
    text/x-component                    htc;
    text/x-markdown                     md;

    video/3gpp                          3gp 3gpp;
    video/avi                           avi;
    video/mp4                           f4p f4v m4v mp4;
    video/mpeg                          mpeg mpg;
    video/ogg                           ogv;
    video/quicktime                     mov;
    video/webm                          webm;
    video/x-flv                         flv;
    video/x-matroska                    mkv;
    video/x-ms-wmv                      wmv;
}
```

## 开启超时时间

通过设置 Expires，开启缓存。

```conf
location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|flv|ico)$ {
    expires 30d;
    access_log off;
}

location ~ .*\.(eot|ttf|otf|woff|svg)$ {
    expires 30d;
    access_log off;
}

location ~ .*\.(js|css)?$ {
    expires 7d;
    access_log off;
}
```
