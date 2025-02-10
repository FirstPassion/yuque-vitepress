需要设置`secure_file_priv`

```plain
[mysqld]
secure_file_priv=""
```

导入`csv`文件，文件要放在`mysql`安装目录下面的`data`目录下

```plsql
LOAD DATA INFILE 'xxx.csv'
INTO TABLE table_name
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;
```

导出`csv`文件

```plsql
SELECT 字段
INTO OUTFILE 'xxx.csv'
FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"'
LINES TERMINATED BY '\n'
FROM table_name;
```

