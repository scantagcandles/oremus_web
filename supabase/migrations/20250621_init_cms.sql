-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create parishes table
create table if not exists parishes (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    address text,
    phone text,
    email text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create priests table
create table if not exists priests (
    id uuid primary key default uuid_generate_v4(),
    parish_id uuid references parishes(id) on delete cascade,
    first_name text not null,
    last_name text not null,
    role text,
    email text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create masses table
create table if not exists masses (
    id uuid primary key default uuid_generate_v4(),
    parish_id uuid references parishes(id) on delete cascade,
    priest_id uuid references priests(id) on delete set null,
    date date not null,
    time time not null,
    type text not null,
    language text default 'pl',
    max_intentions int default 1,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create mass_intentions table
create table if not exists mass_intentions (
    id uuid primary key default uuid_generate_v4(),
    mass_id uuid references masses(id) on delete cascade,
    content text not null,
    requestor_name text not null,
    requestor_email text,
    requestor_phone text,
    status text not null default 'pending',
    payment_status text not null default 'pending',
    payment_amount decimal(10,2),
    payment_id text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create announcements table
create table if not exists announcements (
    id uuid primary key default uuid_generate_v4(),
    parish_id uuid references parishes(id) on delete cascade,
    title text not null,
    content text not null,
    publish_date date not null,
    end_date date,
    is_published boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table with roles
create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    parish_id uuid references parishes(id) on delete cascade,
    email text unique not null,
    role text not null default 'user',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create row level security policies
alter table parishes enable row level security;
alter table priests enable row level security;
alter table masses enable row level security;
alter table mass_intentions enable row level security;
alter table announcements enable row level security;
alter table users enable row level security;

-- Policies for parish admins
create policy "Parish admins can do everything"
    on parishes for all
    using (
        auth.uid() in (
            select id from users
            where role = 'admin'
            and parish_id = parishes.id
        )
    );

-- Similar policies for other tables...

-- Create functions for common operations
create or replace function get_parish_masses(
    parish_id uuid,
    start_date date,
    end_date date
) returns setof masses as $$
    select *
    from masses
    where parish_id = $1
    and date between $2 and $3
    order by date, time;
$$ language sql security definer;
