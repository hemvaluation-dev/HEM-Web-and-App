-- Optional operational note. No existing case values are rewritten.
alter table public.cases add column if not exists customer_response_remark text
  check (char_length(customer_response_remark) <= 2000);
