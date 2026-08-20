-- 兰州大学短视频消费观调研 - Supabase Postgres 建表
-- 在 Supabase SQL Editor 中直接执行，或本地 psql 执行

create table if not exists survey_responses (
  id bigserial primary key,
  created_at timestamptz default now(),

  -- A 人口学
  a1_gender text check (a1_gender in ('男','女','其他','不愿透露')),
  a2_grade text check (a2_grade in ('大一','大二','大三','大四')),
  a3_college text,
  a4_expense text,
  a5_hometown text,
  a6_self numeric(3,2), -- A6-a均分 1-5
  a6_obj int check (a6_obj between 0 and 3),

  -- B 行为
  b1_platform text,
  b2_duration text,
  b2_duration_min int, -- 中点 15/45/90/150/210
  b3_freq text,
  b3_freq_count int,
  b4_prefs text[], -- 存数组 {'搞笑','带货直播'}
  b5_live_freq text,
  b6_1 int check (b6_1 between 1 and 5),
  b6_2 int check (b6_2 between 1 and 5),
  b6_3 int check (b6_3 between 1 and 5),
  b6_avg numeric(3,2),
  b7_1 int, b7_2 int, b7_3 int, b7_4 int,
  b7_avg numeric(3,2),

  -- C 中介
  c1_1 int, c1_2 int, c1_3 int, c1_4 int, c1_avg numeric(3,2),
  c2_1 int, c2_2 int, c2_3 int, c2_avg numeric(3,2),
  c3_1 int, c3_2 int, c3_3 int, c3_4 int, c3_5 int, c3_avg numeric(3,2),

  -- ATT / MK / 效标
  att_correct boolean default true,
  mk1 int, mk2 int,
  d1_regret int, -- 后悔效标题不计分

  -- D 因变量
  d1_1 int, d1_2 int, d1_3 int, d1_4 int, -- d1_3 已是反向后
  d1_avg numeric(3,2),
  d2_1 int, d2_2 int, d2_3 int, d2_4 int, d2_avg numeric(3,2),

  -- E 调节
  e1_1 int, e1_2 int, e1_3 int, e1_avg numeric(3,2),
  e2_choices text[], -- {'学校财商课程','媒介素养'}
  e2_moment text,
  e2_tip text,

  -- 质控
  user_agent text,
  ip_hash text, -- 存 hash，不存明文IP
  duration_seconds int
);

-- 只读视图给 SPSS 导出用
create or replace view v_survey_export as
select * from survey_responses order by created_at desc;

-- 可选：限匿名插入（配合 Supabase RLS，如用 pg 直连则靠 API 校验）
alter table survey_responses enable row level security;
drop policy if exists "allow_insert" on survey_responses;
create policy "allow_insert" on survey_responses for insert with check (true);
drop policy if exists "allow_select_anon" on survey_responses;
-- 默认不允许匿名 select，如需导出请用 service_role
