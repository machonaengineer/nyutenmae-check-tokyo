-- Track recurring reports by address/building as well as shop name.
-- This does not assert common ownership; it only changes the review tag wording.

update public.risk_tags
set label = '同一住所・同一建物で類似報告あり',
    updated_at = now()
where slug = 'similar-reports-same-address'
  and label <> '同一住所・同一建物で類似報告あり';
