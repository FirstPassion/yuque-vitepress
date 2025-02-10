### vite设置路径别名
```javascript
import { resolve } from "path"

export default defineConfig({
  // ...
  resolve: {
    alias: {
      /** @ 符号指向 src 目录 */
      "@": resolve(__dirname, "./src")
    }
  }
})

```

### vite动态引入组件
```javascript
// 获取所有的路由组件,路径不能是变量
const components = import.meta.glob(`@/views/**/*.vue`, { eager: true })
```

### vue-router@4动态添加路由
```javascript
router.addRoute({ name: 'admin', path: '/admin', component: Admin })
// 嵌套路由需要指定父路由的 name
router.addRoute('admin', { path: 'settings', component: AdminSettings })
```

### 404路由需要最后添加
```javascript
 // 兜底的404页面
import NotFound from '../views/NotFound.vue'

router.addRoute({ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound })
```

### 动态添加路由之后需要重定向一下，不然找不到
```javascript
next({ ...to, replace: true })
```

### 后台路由格式
children里面的path不需要在最前面加`/`，不然动态添加不上

```json
[
    {
        "path": "/user",
        "name": "User",
        "component": "Layout",
        "redirect": "/user/index",
        "children": [
            {
                "path": "index",
                "name": "user",
                "component": "/views/User.vue"
            }
        ]
    }
]
```

### permission.js
```javascript
import router from './index'
import Layout from '@/layout/index.vue'
import NotFound from '@/views/404.vue'

// 模拟后台给的动态路由数据
import user from '@/api/user.json'
import admin from '@/api/admin.json'

// 获取所有的路由组件,路径不能是变量
const components = import.meta.glob(`@/views/**/*.vue`, { eager: true })

// 生成动态路由
const generateRoutes = routes => {
    const res = []
    // 处理component
    routes.forEach(route => {
        const component = route.component
        if (component === 'Layout') {
            route.component = Layout
        } else {
            route.component = components[`/src${component}`]?.default
        }
        res.push(route)
        if (route.children && route.children.length > 0) {
            generateRoutes(route.children)
        }
    })
    return res
}

// 动态添加路由
const addRoutes = (routes, parent = '') => {
    routes.forEach(route => {
        // 没有父路由
        if (parent === '') {
            // 直接添加
            router.addRoute(route)
        } else {
            // 指定父路由的name
            router.addRoute(parent, route)
        }
        // 递归调用
        if (route.children && route.children.length > 0) {
            addRoutes(route.children, route.name)
        }
    })
}

// 允许直接访问的路由
const withRoute = ['/login']

// 前置路由拦截
router.beforeEach((to, from, next) => {
    // 判断to.path是否在withRoute数组中
    if (withRoute.indexOf(to.path) > -1) {
        next()
    } else {
        // 获取token(用户权限什么的)
        const token = localStorage.getItem('token') || ''
        if (token) {
            // 如果路由存在直接放行
            if (router.hasRoute(to.name)) {
                next()
            } else {
                // 动态路由
                let dyRoutes
                if (token === 'admin') {
                    dyRoutes = generateRoutes(admin)
                } else if (token === 'user') {
                    dyRoutes = generateRoutes(user)
                }
                // 动态添加路由
                addRoutes(dyRoutes)
                // 兜底
                router.addRoute({ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound })
                next({ ...to, replace: true })
            }
        } else {
            // 没有登录就跳转到登录页面
            next('/login')
        }
    }
})
```

