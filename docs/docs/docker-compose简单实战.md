### 创建一个springboot项目，加入依赖
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-jdbc</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.29</version>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### 编写实体类
```java
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Data
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String name;
    private String password;
}
```

### 编写repository类
```java
import com.da.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
```

### 编写controller类
```java
import com.da.app.entity.User;
import com.da.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
public class SystemController {
    @Autowired
    UserRepository userRepository;

    @Autowired
    StringRedisTemplate template;

    @GetMapping
    public List<User> index() {
        System.out.println("name ==> " + template.opsForValue().get("name"));
        return userRepository.findAll();
    }

    @GetMapping("/add")
    public String add() {
        User user = new User();
        user.setName(UUID.randomUUID().toString());
        user.setPassword(UUID.randomUUID().toString());
        userRepository.save(user);
        template.opsForValue().set("name", UUID.randomUUID().toString());
        return "添加成功";
    }

}
```

### 配置application.yml
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    # app_mysql 是docker-compose.yml中配置的mysql容器的名字
    url: jdbc:mysql://app_mysql:3306/jpa
    username: root
    password: 123456.root
  jpa:
    database: mysql
    show-sql: true
    hibernate:
      ddl-auto: update
  redis:
  # app_redis 是docker-compose.yml中配置的redis容器的名字
    host: app_redis
```

### 编写`Dockerfile`构建镜像
```dockerfile
FROM adoptopenjdk/openjdk8
LABEL authors="da"
# 把打好的jar包复制到容器中,根据项目打包出来的写
COPY target/docker-test-0.0.1-SNAPSHOT.jar app.jar
# 用java执行app.jar
CMD java -jar app.jar
```

### 构建镜像
```shell
# 使用当前目录下的Dockerfile文件构建镜像
# springboot-test是构建后,镜像的名字
docker build -t springboot-test . 
```

### 编写`docker-compose.yml`文件
```yaml
version: "3.9" # 这个版本号是根据docker版本来的
services:
  spring: # 服务名称,自己随便取
    container_name: app_springboot # 一会要创建的容器名称
    #    build: . # build表示使用构建的镜像, .表示用当前目录下Dockerfile文件构建
    image: springboot-test # 指定镜像构建
    ports:
      - "8080:8080" # 端口映射
    depends_on: # 这里设置一下依赖,需要等待mysql启动后才运行,不过没用
      - mysql
    restart: always # 容器停止后自动重启
  mysql:
    container_name: app_mysql
    image: mysql:latest # image表示要使用的镜像,本地没有会从远程仓库下载
    environment: # 通过环境变量配置mysql的账号和密码
      MYSQL_ROOT_HOST: '%' # 登录的主机
      MYSQL_ROOT_PASSWORD: '123456.root' # 密码
      MYSQL_DATABASE: 'jpa' # 启动时自动创建的数据库
      TZ: 'Asia/Shanghai' # 时区
    ports:
      - "3306:3306" # 端口映射,也可以不暴露,因为在一个网络下
  redis:
    container_name: app_redis
    image: redis:latest
```

### 启动
```shell
docker-compose up # 前台启动
docker-compose up -d # 后台启动
```

### 停止并且删除
```shell
docker-compose down
```

