create extension if not exists pgcrypto;


create table if not exists public.smart_cards (

    id uuid
        primary key
        default gen_random_uuid(),

    public_code text
        not null
        unique,

    owner_id uuid
        not null
        references auth.users(id)
        on delete cascade,

    label text
        not null
        default 'Smart Card',

    destination_url text
        not null,

    enabled boolean
        not null
        default true,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now()

);


alter table
    public.smart_cards
enable row level security;


drop policy if exists
    "owners read own cards"
on
    public.smart_cards;


create policy
    "owners read own cards"
on
    public.smart_cards
for select
to authenticated
using (
    owner_id =
    auth.uid()
);


drop policy if exists
    "owners create own cards"
on
    public.smart_cards;


create policy
    "owners create own cards"
on
    public.smart_cards
for insert
to authenticated
with check (
    owner_id =
    auth.uid()
);


drop policy if exists
    "owners update own cards"
on
    public.smart_cards;


create policy
    "owners update own cards"
on
    public.smart_cards
for update
to authenticated
using (
    owner_id =
    auth.uid()
)
with check (
    owner_id =
    auth.uid()
);


drop policy if exists
    "owners delete own cards"
on
    public.smart_cards;


create policy
    "owners delete own cards"
on
    public.smart_cards
for delete
to authenticated
using (
    owner_id =
    auth.uid()
);
