-- Comment articles: shown without a title or card background, in a handwriting font.
-- Existing articles default to false, so they keep rendering as normal articles.
alter table public.articles add column is_comment boolean not null default false;
