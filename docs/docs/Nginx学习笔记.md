下载Nginx [https://nginx.org/en/download.html](https://nginx.org/en/download.html)



### Nginx常用命令


启动`Nginx`，默认访问`[http://localhost](http://localhost/)/`就能看到`Nginx`的欢迎页面了

```shell
nginx
```

重启`Nginx`

```shell
nginx -s reload
```

停止`Nginx`

```shell
nginx -s stop
```

### 编辑`Nginx`安装目录下的`conf/nginx.conf`文件
```nginx
http {
	# 响应正确的资源响应头
	include mime.types;

	# 要代理的服务器
	upstream backendserver {
		server 127.0.0.1:1111;
		server 127.0.0.1:2222;
		server 127.0.0.1:3333;
	}

	server {
		
		# 指定监听的端口
		listen 8080;
		
		# 指定资源文件根目录,默认会找index.html
		root D:/ruanjian/nginx/nginx-1.25.3/test;

		# 负载均衡
		location /a {
			proxy_pass http://backendserver/;
		}

		# 指定路由访问根目录下的目录下的文件
		location /one {
			root D:/ruanjian/nginx/nginx-1.25.3/test;
		}
		
		# 指定别名
		location /two {
			alias D:/ruanjian/nginx/nginx-1.25.3/test/one;
		}
		
		# 如果目录下没有默认的index.html,则需要指定一下默认要访问的页面
		location /demo {
			root D:/ruanjian/nginx/nginx-1.25.3/test;
			# 要指定兜底的页面,找不到demo.html时会找根目录下的index.html
			try_files /demo/demo.html /index.html = 404;
		}
		
		# 307 重定向,返回重定向后的路由路径,浏览器路径会变化为重定向后的路径
		location /cdx {
			return 307 /one;
		}
		
		# 重定向,正则匹配/number/数字,重定向到/count/数字下,浏览器路径不会变化
		rewrite ^/number/(\w+) /count/$1;
		
		# 正则匹配路由路径
		location ~* /count/[0-9] {
			root D:/ruanjian/nginx/nginx-1.25.3/test;         
			try_files /index.html = 404;
		}
	}
}

events {}
```

### 部署打包的vue项目的配置
```nginx
server {
        listen       3000;
        server_name  localhost;

        location / { # 配置文件根目录
            root   html/dist;
            index  index.html;
            gzip_static on; #静态压缩
            # 刷新问题
            try_files $uri $uri/ /index.html; 
        }


        location /api { # 配置跨域,这里的api跟上面的对应
            proxy_pass http://localhost:8081/;
        }

}
```

