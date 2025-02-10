## 原理
1. 函数式接口继承`Serializable`时，编译器在编译`Lambda`表达式时，生成了一个`writeReplace`方法，这个方法会返回`SerializedLambda`，可以反射调用这个方法
2. `SerializedLambda`是对`Lambda`表达式进行描述的对象，在`Lambda`表达式可序列化的时候（函数式接口继承Serializable）才能得到
3. 通过`SerializedLambda`得到`Lambda`表达式中方法引用的方法名

## 代码实现
```java
import java.io.Serializable;

@FunctionalInterface
public interface IGet<T> extends Serializable {
    Object get(T source);
}

```



```java
import java.io.Serializable;

@FunctionalInterface
public interface ISet<T, V> extends Serializable {
    void set(T source, V value);
}

```

```java
import java.io.Serializable;
import java.lang.invoke.SerializedLambda;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class Util {

    /**
     * 获取get方法的属性名字
     */
    public static <T> String convertToFieldName(IGet<T> fun) {
        try {
            SerializedLambda lambda = getSerializedLambda(fun);
            String methodName = lambda.getImplMethodName();
            String prefix = null;
            if (methodName.startsWith("get")) {
                prefix = "get";
            } else if (methodName.startsWith("is")) {
                prefix = "is";
            }
            if (prefix == null) {
                throw new RuntimeException("无效的getter方法: " + methodName);
            }
            return toLowerCaseFirstOne(methodName.replace(prefix, ""));
        } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 获取set方法的属性名字
     */
    public static <T, V> String convertToFieldName(ISet<T, V> fun) {
        try {
            SerializedLambda lambda = getSerializedLambda(fun);
            String methodName = lambda.getImplMethodName();
            if (!methodName.startsWith("set")) {
                throw new RuntimeException("无效的setter方法: " + methodName);
            }
            return toLowerCaseFirstOne(methodName.replace("set", ""));
        } catch (NoSuchMethodException | InvocationTargetException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 字符串首字母转小写
     */
    private static String toLowerCaseFirstOne(String field) {
        if (Character.isLowerCase(field.charAt(0)))
            return field;
        else {
            char firstOne = Character.toLowerCase(field.charAt(0));
            String other = field.substring(1);
            return firstOne + other;
        }
    }


    /**
     * 获取SerializedLambda对象
     */
    private static SerializedLambda getSerializedLambda(Serializable fun) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        Method method = fun.getClass().getDeclaredMethod("writeReplace");
        method.setAccessible(Boolean.TRUE);
        return (SerializedLambda) method.invoke(fun);
    }

}
```

## 测试
```java
public class Test {
    public static void main(String[] args) {
        System.out.println(Util.convertToFieldName(User::getName));
        System.out.println(Util.convertToFieldName(User::setName));
    }
}
```

