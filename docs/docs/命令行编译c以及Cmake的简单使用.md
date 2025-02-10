# 编译时中文乱码
-finput-charset=utf-8 (源文件编码格式)

-fexec-charset=gbk (系统默认编码格式,windows默认gbk)

```shell
gcc -o 生成的exe文件名字 源文件 -finput-charset=utf-8 -fexec-charset=gbk
```

# cmake的简单使用
查看版本

```shell
cmake --version
```



编写CMakeLists.txt

```plain
# 设置cmake的最小版本
cmake_minimum_required(VERSION 3.14)
# 设置编译器路径
set(CMAKE_CXX_COMPILER "D:/aaa/c/mingw64/bin/g++.exe")
set(CMAKE_C_COMPILER "D:/aaa/c/mingw64/bin/gcc.exe")
# 当前项目的名称
project(demo)
# 增加 -std=c++11 编译选项
set(CMAKE_CXX_STANDARD 11)
# 指定头文件路径 PROJECT_SOURCE_DIR宏对应的是当前目录的根目录
include_directories(${PROJECT_SOURCE_DIR}/include)
# 指定库文件路径
link_directories(${PROJECT_SOURCE_DIR}/lib)
#[[
aux_source_directory(<dir> <variable>)
dir 要搜索的目录
variable 搜索到的源文件列表保存到这个变量中
]]
aux_source_directory(${PROJECT_SOURCE_DIR}/src SRCS)
# 指定可执行文件输出路径
set(EXECUTABLE_OUTPUT_PATH ${PROJECT_SOURCE_DIR}/bin)
# 设置编译选项 (-finput-charset=指定源代码格式 -fexec-charset=可执行文件编码格式)
add_compile_options(-g -Wunused -finput-charset=utf-8 -fexec-charset=GBK)
# 生成可执行文件
add_executable(demo ${SRCS})
```

生成makefile

```shell
cmake -G "MinGW Makefiles" .
```

生成可执行文件

```shell
mingw32-make
```

