```xml
<dependency>
  <groupId>org.samba.jcifs</groupId>
  <artifactId>jcifs</artifactId>
  <version>1.3.14-kohsuke-1</version>
</dependency>
```

```java
import jcifs.smb.NtlmPasswordAuthentication;
import jcifs.smb.SmbFile;

public static SmbFile getSmbSpace(String path) {
    SmbFile smbFile = null;
    try {
        //            要操作的文件路径
        String url = "smb://ip/文件夹/cache/" + path;
        //            密码验证
        final NtlmPasswordAuthentication auth = new NtlmPasswordAuthentication("192.168.1.2", "47508622", "123456");
        smbFile = new SmbFile(url, auth);
        //            尝试连接
        smbFile.connect();
    } catch (IOException e) {
        e.printStackTrace();
    }
    return smbFile;
}
```

```java
public static void main(String[] args) throws IOException {
    SmbFile test = getSmbSpace("test.txt");
    final OutputStream os = test.getOutputStream();
    os.write("我为什么这么帅".getBytes(StandardCharsets.UTF_8));
    os.flush();
    os.close();
    final InputStream is = test.getInputStream();
    final byte[] buff = new byte[1024];
    is.read(buff);
    System.out.println(new String(buff));
}
```

```java
final SmbFile file = new SmbFile("smb://账号:密码@192.168.1.2/公共空间/阿达/cache/test.txt");
final BufferedReader reader = new BufferedReader(new InputStreamReader(new SmbFileInputStream(file)));
System.out.println(reader.readLine());
reader.close();
```

