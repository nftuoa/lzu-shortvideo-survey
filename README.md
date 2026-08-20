# 大学生短视频使用与消费观调查

匿名问卷，约8分钟。数据仅作聚合分析。

## 在线填写
- http://www.nftuoa.top/lzu-shortvideo-survey/

## 本地开发
```bash
npm install
cp .env.example .env  # 填入 DATABASE_URL
psql "$DATABASE_URL" -f sql/schema.sql
npm run dev
```

## 数据导出
Supabase SQL Editor 执行 `select * from v_survey_export;` 导出 CSV。
