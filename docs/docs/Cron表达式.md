<font style="color:rgb(37, 41, 51);">Cron表达式是一种用于指定定时任务执行时间的字符串表示形式。它由6个或7个字段组成，每个字段表示任务执行的时间单位和范围。</font>

<font style="color:rgb(37, 41, 51);">Cron表达式的典型格式如下：</font>

---



<font style="color:rgb(37, 41, 51);">┬    ┬    ┬    ┬    ┬    ┬  
</font><font style="color:rgb(37, 41, 51);">│    │    │    │    │    │  
</font><font style="color:rgb(37, 41, 51);">│    │    │    │    │    └── 星期（0 - 6，0表示星期日）  
</font><font style="color:rgb(37, 41, 51);">│    │    │    │    └───── 月份（1 - 12）  
</font><font style="color:rgb(37, 41, 51);">│    │    │    └────────── 日（1 - 31）  
</font><font style="color:rgb(37, 41, 51);">│    │    └─────────────── 小时（0 - 23）  
</font><font style="color:rgb(37, 41, 51);">│    └──────────────────── 分钟（0 - 59）  
</font><font style="color:rgb(37, 41, 51);">└───────────────────────── 秒（0 - 59）</font>

| <font style="color:rgb(37, 41, 51);">域</font> | <font style="color:rgb(37, 41, 51);">是否必需</font> | <font style="color:rgb(37, 41, 51);">取值范围</font> | <font style="color:rgb(37, 41, 51);">特殊字符</font> |
| --- | --- | --- | --- |
| <font style="color:rgb(37, 41, 51);">秒 Seconds</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[0, 59]</font> | <font style="color:rgb(37, 41, 51);">* , - /</font> |
| <font style="color:rgb(37, 41, 51);">分钟 Minutes</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[0, 59]</font> | <font style="color:rgb(37, 41, 51);">* , - /</font> |
| <font style="color:rgb(37, 41, 51);">小时 Hours</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[0, 23]</font> | <font style="color:rgb(37, 41, 51);">* , - /</font> |
| <font style="color:rgb(37, 41, 51);">日期 DayofMonth</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[1, 31]</font> | <font style="color:rgb(37, 41, 51);">* , - / ? L W</font> |
| <font style="color:rgb(37, 41, 51);">月份 Month</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[1, 12]或[JAN, DEC]</font> | <font style="color:rgb(37, 41, 51);">* , - /</font> |
| <font style="color:rgb(37, 41, 51);">星期 DayofWeek</font> | <font style="color:rgb(37, 41, 51);">是</font> | <font style="color:rgb(37, 41, 51);">[1, 7]或[MON, SUN]。若使用[1, 7]表达方式，1代表星期一，7代表星期日。</font> | <font style="color:rgb(37, 41, 51);">* , - / ? L #</font> |
| <font style="color:rgb(37, 41, 51);">年 Year</font> | <font style="color:rgb(37, 41, 51);">否</font> | <font style="color:rgb(37, 41, 51);">1970+</font> | <font style="color:rgb(37, 41, 51);">- * /</font> |


每个字段可以接受特定的数值、范围、通配符和特殊字符来指定任务的执行时间：

+ 数值：表示具体的时间单位，如1、2、10等。
+ 范围：使用-连接起始和结束的数值，表示一个范围内的所有值，如1-5表示1到5的所有数值。
+ 通配符：使用*表示匹配该字段的所有可能值，如*表示每分钟、每小时、每天等。
+ 逗号分隔：使用逗号分隔多个数值或范围，表示匹配其中任意一个值，如1,3表示1或3。
+ 步长：使用/表示步长，用于指定间隔的数值，如*/5表示每隔5个单位执行一次。
+ 特殊字符：Cron表达式还支持一些特殊字符来表示特定的含义，如?用于替代日和星期字段中的任意值，L表示最后一天，W表示最近的工作日等。

```markdown
* * * * *：每分钟执行一次任务。
0 * * * *：每小时的整点执行一次任务。
0 0 * * *：每天的午夜执行一次任务。
0 0 * * 1：每周一的午夜执行一次任务。
0 0 1 * *：每月的1号午夜执行一次任务。
0 0 1 1 *：每年的1月1日午夜执行一次任务。
```

