import { defineConfig } from 'vitepress'
import { genYuqueSideBar } from "../../utils/route";
import { YuQueSVG } from "../../utils/assists";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "zh-CN",
  title: "Da的博客",
  description: "记录逐渐秃头的日子",
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  head: [
    [
      'link', { rel: 'icon', href: '/favicon.ico' }
    ]
  ],
  themeConfig: {
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 4], // 显示2-4级标题
      label: '大纲' // 文字显示
    },
    nav: [
      { text: '首页', link: '/' },
      { text: '我的笔记', link: '/docs/快速开始', activeMatch: '/docs/' },
    ],
    sidebar: {
      "/docs/": await genYuqueSideBar('/docs'),
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    returnToTopLabel: '返回顶部',
    socialLinks: [
      { icon: { svg: YuQueSVG }, link: "https://www.yuque.com/u29148723/thm3g9" },
      { icon: 'github', link: 'https://github.com/FirstPassion' }
    ],
    footer: {
      message: 'Powered by <a href="https://www.yuque.com/u29148723/thm3g9" target="_blank">语雀</a>  & <a href="https://vitepress.dev" target="_blank">VitePress</a> with <a href="https://github.com/LetTTGACO/elog" target="_blank">Elog</a>',
      copyright: 'Copyright © 2025-present'
    },
  }
})
