# Tokee - 服务状态监控

基于 SolidJS 和 Tailwind CSS 构建的现代化服务状态监控面板，使用 UptimeRobot Stats API 展示监控数据。
计划在2.0.0采用Astro框架重构，以获得更好的性能和更简单的开发体验。

## 技术栈

- [SolidJS](https://solidjs.com) - 响应式 UI 框架
- [Tailwind CSS](https://tailwindcss.com) - 实用优先的 CSS 框架

## 配置

在 `src/App.tsx` 中修改 `STATUSPAGE_ID` 为你的 UptimeRobot Status Page ID：

```typescript
const STATUSPAGE_ID = 'your-statuspage-id';
```
