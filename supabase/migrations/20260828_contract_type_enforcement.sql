-- ============================================================
-- CONTRACT TYPE ENFORCEMENT (OPTIONAL)
-- ============================================================

-- Weaver can only emit opportunity + recommendation
create policy "weaver-contracts"
  on opportunity
  for insert using (auth.jwt()->>'subsystem' = 'weaver');

create policy "weaver-contracts-rec"
  on recommendation
  for insert using (auth.jwt()->>'subsystem' = 'weaver');

-- Guardian can only emit authorization
create policy "guardian-contracts"
  on authorization
  for insert using (auth.jwt()->>'subsystem' = 'guardian');

-- Glue can only emit execution
create policy "glue-contracts"
  on execution
  for insert using (auth.jwt()->>'subsystem' = 'glue');

-- DualPay can only emit payment
create policy "dualpay-contracts"
  on payment
  for insert using (auth.jwt()->>'subsystem' = 'dualpay');
