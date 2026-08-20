# 兰州大学短视频消费观调研 - 静态+Serverless

## 结构
```
survey-site/
  public/index.html  # 静态问卷（对应 02_问卷定稿 v2.0）
  api/submit.js      # Vercel Serverless 写库（pg直连 Supabase）
  api/health.js      # 健康检查
  sql/schema.sql     # 建表 SQL
  vercel.json
  package.json
```

## 本地开发
```bash
cd survey-site
npm install
# 设置本地环境变量（不要提交）
echo 'DATABASE_URL=postgresql://postgres.cdebutpykrqzfiqhkpib:Mo2939829009@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true' > .env
# 建表（本地 psql）
psql "$DATABASE_URL" -f sql/schema.sql
# 本地预览（需 Vercel CLI）
npx vercel dev
# 或直接用静态预览
npx serve public
```

## 部署到 Vercel（推荐）
1. GitHub 新建仓库后推送：
```bash
git init && git add . && git commit -m "init: LZU survey static+serverless"
gh repo create lzu-shortvideo-survey --public --source=. --push
```
2. Vercel 导入该仓库，Framework 选 Other
3. 在 Vercel -> Settings -> Environment Variables 添加 `DATABASE_URL`（贴上面那串，Value 选 Encrypted）
4. Deploy，访问 `https://你的项目.vercel.app` 即可收数据；`/api/health` 应返回 ok

## 数据导出
Supabase SQL Editor:
```sql
select * from v_survey_export; -- 导出 CSV
```
或用 `psql` 导出：
```bash
psql "$DATABASE_URL" -c "copy (select * from survey_responses) to stdout with csv header" > export.csv
```

## 安全注意
- 绝对不要把 DATABASE_URL 提交到 Git，已用 .gitignore 忽略 .env
- 你贴出的密码已在 Supabase Dashboard 暴露，建议去 Database -> Reset password 立即重置，并同步更新 Vercel 环境变量
- 前端已做注意力检测(att=5)与时长/互斥校验，后端二次校验，满足 02 质控要求
