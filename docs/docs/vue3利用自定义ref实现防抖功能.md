### 使用自定义ref实现延迟更新数据
```javascript
import { customRef } from 'vue'

export function debounceRef(value, delay=1000){
  let timer // 定时器
  return customRef((track, trigger) => {
    return {
      get(){
        // 依赖收集
        track()
        return value
      },
      set(val){
        // 清空上一次的定时器
        clearTimeout(timer)
        // 使用定时器延迟执行数据更新
        timer = setTimeout(() => {
          value = val
          // 触发更新
          trigger()
        }, delay)
      }
    }
  })
}
```

