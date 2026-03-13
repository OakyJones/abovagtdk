-- Add GoCardless requisition ID to users table
alter table users add column if not exists gocardless_requisition_id text;

-- Add provider column to bank_connections for tracking GoCardless vs Tink
alter table bank_connections add column if not exists provider text not null default 'gocardless';
