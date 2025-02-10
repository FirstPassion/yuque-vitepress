

## Starter功能
整合模块需要的所有依赖，同一到starter里，提供默认配置，并且允许自定义更改默认的配置

## Starter规范
官方的Starter包规范：`spring-boot-starter-xxx`

自定义的Starter包规范：`xxx-spring-boot-starter`

## 自定义starter
添加必要的依赖

```xml
<!--        spring-boot自动配置需要的依赖-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-actuator-autoconfigure</artifactId>
    <version>2.7.0</version>
</dependency>
<!--        配置提示需要加上-->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <version>2.7.0</version>
</dependency>
```

创建功能类

```java
public class MyService {

    private final MyProperties properties;

    public MyService(MyProperties properties) {
        this.properties = properties;
    }

    public void sayName() {
        System.out.println("名字是: " + properties.getName());
    }

}
```

创建配置绑定类

```java
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "my") // 设置starter配置的前缀名
public class MyProperties {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

创建自动配置类

```java
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@EnableConfigurationProperties({MyProperties.class}) // 指定刚刚自定义的配置绑定类
@Configuration
// 加载默认的配置文件 value 属性指定默认的配置文件
@PropertySource(name = "自定义starter的默认配置值", value = "classpath:/META-INF/my-default.properties")
public class MyAutoConfiguration {

    //把功能类放到容器中
    @Bean
    public MyService myService(MyProperties properties) {
        return new MyService(properties);
    }
    
}
```

在`resources`目录下创建`META-INF`文件夹，然后在`META-INF`文件夹下创建默认的配置文件`my-default.properties`和`spring`文件夹，最后在`spring`文件夹下创建`org.springframework.autoconfigure.AutoConfiguration.imports`文件

在默认的配置文件中配置默认的属性

```properties
my.name=达 # 前缀要和上面指定的一样
```

在`org.springframework.autoconfigure.AutoConfiguration.imports`文件中写上自动装配类的包名.类名

```properties
com.da.MyAutoConfiguration
```

然后就可以让springboot应用自己定义的starter了

