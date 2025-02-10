## 安装
```shell
python -m venv .venv # 创建虚拟环境

.\.venv\Scripts\activate # 使用虚拟环境(windows上)

pip install Django # 安装Django

python -m django --version # 查看Django是否安装
```

## 创建`Django`项目
```shell
django-admin startproject 项目名字
```

## 项目结构
```shell
项目名字/								# 根目录名称对 Django 没有影响，你可以将它重命名为任何你喜欢的名称
    manage.py 					# 管理 Django 项目的命令行工具
    项目名字/						# 该目录包含你的项目，它是一个纯 Python 包。它的名字就是当你引用它内部任何东西时需要用到的 Python 包名				
        __init__.py			# 一个空文件，告诉 Python 这个目录应该被认为是一个 Python 包
        settings.py			# Django 项目的配置文件
        urls.py					# Django 项目的 URL 声明，就像你网站的“目录”
        asgi.py					# 作为你的项目的运行在 ASGI 兼容的 Web 服务器上的入口(一般不用修改)
        wsgi.py					# 作为你的项目的运行在 WSGI 兼容的Web服务器上的入口(一般不用修改)
```

## 启动项目
<font style="color:rgb(12, 60, 38);">如果运行成功，通过浏览器访问 </font>[http://127.0.0.1:8000/](http://127.0.0.1:8000/)<font style="color:rgb(12, 60, 38);"> 。就会看到一个“祝贺”页面，有一只火箭正在发射</font>

<font style="color:rgb(12, 60, 38);">用于开发的服务器在需要的情况下会对每一次的访问请求重新载入一遍 Python 代码。所以不用为了让修改的代码生效而频繁的重新启动服务器。但是有一些情况：比如添加新文件，不会触发自动重新加载，这时就需要自己手动重启服务器</font>

```shell
# 默认情况下，runserver 命令会将服务器设置为监听本机内部 IP 的 8000 端口
python manage.py runserver # 在项目的根目录下执行

python manage.py runserver 端口号 # 指定在本机的那个端口运行

python manage.py runserver IP地址:端口号 # 指定服务器监听的IP和端口
```

## 创建应用
<font style="color:rgb(12, 60, 38);">在 </font>`<font style="color:rgb(12, 60, 38);">Django</font>`<font style="color:rgb(12, 60, 38);"> 中，每一个应用都是一个 Python 包，并且遵循着相同的约定</font>

#### <font style="color:rgb(12, 60, 38);">项目和应用有什么区别？</font>
<font style="color:rgb(12, 60, 38);">应用是一个专门做某件事的网络应用程序——比如博客系统，或者公共记录的数据库，或者小型的投票程序。项目则是一个网站使用的配置和应用的集合。项目可以包含很多个应用。应用可以被很多个项目使用</font>

```shell
python manage.py startapp 应用名字 # 在当前项目下创建应用
```

## 应用结构
```shell
应用名字/
    __init__.py
    admin.py
    apps.py
    migrations/
        __init__.py
    models.py
    tests.py
    views.py
```

## 编写视图
编辑创建的应用中的`views.py`文件

```python
from django.http import HttpResponse

def index(request):
    return HttpResponse("这是我在Django中定义的第一个视图函数")
```

<font style="color:rgb(12, 60, 38);">在应用目录中创建一个 URL 配置，在应用目录下创建一个名为 </font>`urls.py`<font style="color:rgb(12, 60, 38);"> 的文件</font>

```python
from django.urls import path
# 导入所有的视图函数
from . import views

# 配置当前应用的的视图函数对应的url
urlpatterns = [
    # path(route, view, kwargs, name)
    # route 是一个匹配 URL 的准则（类似正则表达式）当 Django 响应一个请求时，
    # 它会从 urlpatterns 的第一项开始，按顺序依次匹配列表中的项，直到找到匹配的项
    # view 当 Django 找到了一个匹配的准则，就会调用这个特定的视图函数，
    # 并传入一个 HttpRequest 对象作为第一个参数，被“捕获”的参数以关键字参数的形式传入
    # name 可以给 URL 取名能让你在 Django 的任意地方唯一地引用它，
    # 尤其是在模板中。这个特性允许你只改一个文件就能全局地修改某个 URL 模式
    path('', views.index, name='index')
]
```

然后在根 `URLconf 文件(项目名字/urls.py)`中指定我们创建的 `应用.urls` 模块

```python
from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('admin/', admin.site.urls),
    # 函数 include() 允许引用其它 URLconfs
    # 每当 Django 遇到 include() 时
    # 它会截断与此项匹配的 URL 的部分,并将剩余的字符串发送到 URLconf 以供进一步处理
    # path('浏览器路径/', include('应用名字.urls'))
    path('poll/', include('poll.urls'))
]
```

这时访问 [http://127.0.0.1:8000/自己配置的浏览器路径/](http://127.0.0.1:8000/poll/) 就会看到浏览器页面出现`<font style="color:rgb(0, 0, 0);">这是我在Django中定义的第一个视图函数</font>`

## <font style="color:rgb(0, 0, 0);">数据库配置</font>
打开`项目名字/settings.py`文件，这是个包含了 Django 项目设置的 Python 模块

通常，这个配置文件使用 SQLite 作为默认数据库，Python 内置 SQLite，所以无需安装额外东西来使用它

<font style="color:rgb(12, 60, 38);">如果你想使用其他数据库，你需要安装合适的 </font>`[database bindings](https://docs.djangoproject.com/zh-hans/5.0/topics/install/#database-installation)<font style="color:rgb(12, 60, 38);"> </font>`，<font style="color:rgb(12, 60, 38);">然后改变设置文件中 </font>`DATABASES<font style="color:rgb(12, 60, 38);"> </font>**'default'**`<font style="color:rgb(12, 60, 38);"> 项目中的一些键值</font>

```python
DATABASES = {
    'default': {
        # ENGINE 数据库引擎(默认是sqlite3)
        # django.db.backends.sqlite3
        # django.db.backends.postgresql
        # django.db.backends.mysql
        # django.db.backends.oracle 等
        'ENGINE': 'django.db.backends.sqlite3',
        # 数据库的名称
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

## 应用配置
```python
# 这里包括了会在你项目中启用的所有 Django 应用
INSTALLED_APPS = [
    # 管理员站点
    'django.contrib.admin',
    # 认证授权系统
    'django.contrib.auth',
    # 内容类型框架
    'django.contrib.contenttypes',
    # 会话框架
    'django.contrib.sessions',
    # 消息框架
    'django.contrib.messages',
    # 静态文件管理框架
    'django.contrib.staticfiles',
]
```

## 创建模型
编辑应用下的`models.py`文件

每个模型被表示为 django.db.models.Model 类的子类

每个模型有许多类变量，它们都表示模型里的一个数据库字段

每个字段都是 Field 类的实例 - 比如，字符字段被表示为 CharField ,日期时间字段被表示为 DateTimeField 。这将告诉 Django 每个字段要处理的数据类型。

每个 Field 类实例变量的名字（例如 question_text 或 pub_date ）也是字段名，数据库会将它们作为列名

```python
from django.db import models

class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published")


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
```

配置应用到项目中，编辑`项目名字/settings.py`文件中的`INSTALLED_APPS`，因为 `PollsConfig` 类写在文件 `应用名字/apps.py` 中，所以它的点式路径是 `'应用名字.apps.PollsConfig'`

```python
# 这里包括了会在你项目中启用的所有 Django 应用
INSTALLED_APPS = [
    # 添加自己的应用
    '应用名字.apps.PollsConfig',
    # 管理员站点
    'django.contrib.admin',
    # 认证授权系统
    'django.contrib.auth',
    # 内容类型框架
    'django.contrib.contenttypes',
    # 会话框架
    'django.contrib.sessions',
    # 消息框架
    'django.contrib.messages',
    # 静态文件管理框架
    'django.contrib.staticfiles',
]
```

<font style="color:rgb(12, 60, 38);">检测对模型文件的修改</font>

<font style="color:rgb(12, 60, 38);">通过运行 </font>`makemigrations`<font style="color:rgb(12, 60, 38);"> 命令，</font>`<font style="color:rgb(12, 60, 38);">Django</font>`<font style="color:rgb(12, 60, 38);"> 会检测你对模型文件的修改（在这种情况下，你已经取得了新的），并且把修改的部分储存为一次 迁移</font>

```shell
python manage.py makemigrations 应用名字
```

