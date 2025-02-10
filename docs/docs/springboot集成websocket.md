### 加入依赖
```xml
<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### 添加配置类
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;

/**
 * @author da
 * @time 2023/12/8 下午 9:34
 * websocket配置
 */
@Configuration
public class WebSocketConfig {

    /**
     * 注入一个 ServerEndpointExporter
     * 会自动注册使用 @ServerEndpoint 注解申明的 websocket endpoint
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }

}
```

### 使用
```java
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @author da
 * @time 2023/12/8 下午 9:38
 * websocket 服务
 */
@Slf4j
@ServerEndpoint("/api/ws/{id}")
@Component
public class WebSocketServer {
    /**
     * 用来保存所有的用户和对应的连接对象
     */
    private final Map<String, Session> sessionMap = new ConcurrentHashMap<>();

    /**
     * 监听连接
     *
     * @param session session
     * @param id      当前的用户id
     */
    @OnOpen
    public void onOpen(Session session, @PathParam("id") String id) {
        if (null == id) return;
        if (!sessionMap.containsKey(id)) {
            sessionMap.put(id, session);
            log.info("id为 {} 的用户加入频道", id);
            broadcast("id为 " + id + " 的用户加入频道");
        }
    }

    /**
     * 监听连接断开
     *
     * @param session session
     * @param id      当前的用户id
     */
    @OnClose
    public void onClose(Session session, @PathParam("id") String id) {
        if (null == id) return;
        sessionMap.remove(id);
        broadcast("id为 " + id + " 的用户离开频道");
        log.info("id为 {} 的用户离开频道", id);
    }

    /**
     * 监听连接错误
     *
     * @param session session
     * @param error   错误对象
     */
    @OnError
    public void onError(Session session, Throwable error) {
        log.error("出现错误 {}", error.getMessage());
        throw new RuntimeException(error);
    }

    /**
     * 监听消息
     *
     * @param message 发来的消息
     * @param session session
     * @param id      id
     */
    @OnMessage
    public void onMessage(String message, Session session, @PathParam("id") String id) {
        log.info("收到来自id为 {} 的用户发来的消息: {}", id, message);
        broadcast("收到来自id为 " + id + " 的用户发来的消息: " + message);
    }


    /**
     * 单独发送消息
     *
     * @param session 接收消息的对象
     * @param message 要发送的消息
     */
    private void separately(Session session, String message) {
        try {
            log.info("服务端给客户端 {} 发送消息 {}", session.getId(), message);
            session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            log.error("服务端发送消息给客户端失败", e);
        }
    }

    /**
     * 广播消息
     *
     * @param message 要广播的消息
     */
    private void broadcast(String message) {
        sessionMap.forEach((id, session) -> {
            try {
                log.info("给id为 {} 发送了消息", id);
                session.getBasicRemote().sendText(message);
            } catch (IOException e) {
                log.error("发送消息给id为 {} 失败了", id);
            }
        });
    }

}
```

