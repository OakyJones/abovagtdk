-- Allow day=0 in drip_emails for the immediate quiz result email
alter table drip_emails drop constraint if exists drip_emails_day_check;
alter table drip_emails add constraint drip_emails_day_check check (day in (0, 3, 7, 14, 90));
