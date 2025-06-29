create table public.parishes (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  address text not null,
  city text not null,
  admin_id uuid references auth.users(id) not null,
  status text default 'pending' check (status in ('pending', 'active', 'suspended')) not null,
  settings jsonb default '{}'::jsonb,
  verified_at timestamp with time zone,
  metadata jsonb default '{}'::jsonb
);

-- RLS Policies
alter table public.parishes enable row level security;

create policy "Parishes are viewable by everyone."
  on parishes for select
  using ( true );

create policy "Parishes can only be inserted by authenticated users."
  on parishes for insert
  with check ( auth.role() = 'authenticated' );

create policy "Parishes can only be updated by admin or owner."
  on parishes for update
  using ( 
    auth.uid() = admin_id 
    or 
    exists (
      select 1 
      from auth.users 
      where auth.uid() = id 
      and raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Indices
create index parishes_admin_id_idx on parishes(admin_id);
create index parishes_status_idx on parishes(status);
create index parishes_city_idx on parishes(city);

-- Functions and Triggers
create or replace function public.handle_new_parish()
returns trigger as $$
begin
  -- Update user metadata with parish_id
  update auth.users
  set raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object(
      'parish_id', new.id,
      'parish_role', 'admin'
    )
  where id = new.admin_id;
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_parish_created
  after insert on parishes
  for each row execute procedure public.handle_new_parish();
