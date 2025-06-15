create type mass_intention_status as enum (
  'pending_payment',
  'paid',
  'rejected',
  'cancelled',
  'completed',
  'scheduled',
  'payment_failed'
);

create table mass_intentions (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  preferred_date date not null,
  preferred_time time,
  mass_type text not null,
  requestor_name text not null,
  requestor_email text not null,
  requestor_phone text,
  status mass_intention_status not null default 'pending_payment',
  scheduled_date date,
  scheduled_time time,
  priest_id uuid references auth.users(id),
  church_id uuid references churches(id),
  payment_id text,
  payment_amount integer not null,
  payment_method text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table churches (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null,
  city text not null,
  country text not null default 'Polska',
  timezone text not null default 'Europe/Warsaw',
  contact_email text,
  contact_phone text,
  website text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table mass_intentions enable row level security;
alter table churches enable row level security;

-- Allow authenticated users to view their own intentions
create policy "Users can view own intentions"
  on mass_intentions for select
  using (requestor_email = auth.jwt() ->> 'email');

-- Allow authenticated users to create intentions
create policy "Users can create intentions"
  on mass_intentions for insert
  with check (true);

-- Allow priests to view and update assigned intentions
create policy "Priests can view assigned intentions"
  on mass_intentions for select
  using (priest_id = auth.uid());

create policy "Priests can update assigned intentions"
  on mass_intentions for update
  using (priest_id = auth.uid());

-- Allow admins to view all intentions
create policy "Admins can view all intentions"
  on mass_intentions for all
  using (exists (
    select 1 from auth.users
    where auth.uid() = users.id
    and users.raw_app_meta_data->>'role' = 'admin'
  ));

-- Allow viewing church information
create policy "Anyone can view churches"
  on churches for select
  using (true);

-- Allow admins to manage churches
create policy "Admins can manage churches"
  on churches for all
  using (exists (
    select 1 from auth.users
    where auth.uid() = users.id
    and users.raw_app_meta_data->>'role' = 'admin'
  ));
