# Tokee - 服务状态监控

基于 SolidJS 和 Tailwind CSS 构建的现代化服务状态监控面板，使用 UptimeRobot Stats API 展示监控数据。

## 配置

在 `src/config.ts` 中修改 `pageId` 为你的 UptimeRobot Status Page ID：

```typescript
export const siteConfig: SiteConfig = {
    pageId = 'your-statuspage-id';
};
```
