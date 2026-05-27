begin;

insert into public.areas (slug, name, description, center_label, sort_order)
values
  (
    'roppongi-azabujuban',
    '六本木・麻布十番',
    '深夜帯の料金説明、会計確認、退店時対応に関する注意情報を整理します。',
    '港区六本木、麻布十番周辺',
    50
  ),
  (
    'ginza-shimbashi-yurakucho',
    '銀座・新橋・有楽町',
    '駅周辺や飲食店集積エリアでの入店前説明と会計確認を扱います。',
    '中央区、港区、千代田区の対象周辺',
    60
  ),
  (
    'akasaka-akasakamitsuke',
    '赤坂・赤坂見附',
    '客引き経由の来店、席料やサービス料の説明確認に関する情報を扱います。',
    '港区赤坂、赤坂見附周辺',
    70
  ),
  (
    'kinshicho',
    '錦糸町',
    '繁華街での料金説明、明細提示、会計時対応に関する注意情報を整理します。',
    '墨田区錦糸町周辺',
    80
  ),
  (
    'gotanda',
    '五反田',
    '駅周辺の入店前説明、会計内容、明細提示に関する報告を扱います。',
    '品川区五反田周辺',
    90
  ),
  (
    'tachikawa',
    '立川',
    '多摩エリアの繁華街における料金確認と会計確認の注意情報を整理します。',
    '立川市中心部周辺',
    100
  ),
  (
    'machida',
    '町田',
    '駅周辺での入店前説明、支払い前の金額確認、相談導線を整理します。',
    '町田市中心部周辺',
    110
  ),
  (
    'kichijoji',
    '吉祥寺',
    '駅周辺の飲食店集積エリアでの料金説明と明細確認に関する情報を扱います。',
    '武蔵野市吉祥寺周辺',
    120
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    center_label = excluded.center_label,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

comment on table public.areas is
  'Target areas for public navigation. Area expansion does not publish unapproved reports; public views still expose approved reports only.';

commit;
