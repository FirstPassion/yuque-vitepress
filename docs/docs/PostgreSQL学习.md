## 进入指定数据库
```bash
# psql -h ip -p 端口 -U 账号 数据库名字
psql -h localhost -p 5432 -U postgres demo
```

## 查看所有的数据库
```bash
\l
```

## 使用指定的数据库
```bash
# \c 要使用的数据库名字
\c demo
```

## 创建数据库
```bash
# CREATE DATABASE 数据库名字;
CREATE DATABASE aaa;
```

## 删除数据库
```bash
# DROP DATABASE 数据库名字;
DROP DATABASE aaa;
```

## 创建表
```bash
CREATE TABLE 表名(
   ID INT PRIMARY KEY     NOT NULL,
   NAME           TEXT    NOT NULL,
   AGE            INT     NOT NULL,
   ADDRESS        CHAR(50),
   SALARY         REAL
);
```

## 查看当前数据库中的表
```bash
\d
```

## 查看指定表的信息
```bash
\d 表名
```

## 删除表
```bash
DROP TABLE 表名;
```

