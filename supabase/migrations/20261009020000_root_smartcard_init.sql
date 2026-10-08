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


-- ============================================================
-- ROOT SMARTCARD SECURITY HARDENING
-- ============================================================

alter table public.smart_cards
drop constraint if exists smart_cards_public_code_format;

alter table public.smart_cards
add constraint smart_cards_public_code_format
check (
    public_code ~ '^[A-Z0-9]{8,32}$'
);


alter table public.smart_cards
drop constraint if exists smart_cards_destination_http;

alter table public.smart_cards
add constraint smart_cards_destination_http
check (
    destination_url ~* '^https?://'
);


alter table public.smart_cards
drop constraint if exists smart_cards_label_length;

alter table public.smart_cards
add constraint smart_cards_label_length
check (
    char_length(label) between 1 and 80
);


create or replace function public.root_smartcard_before_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin

    if new.owner_id is distinct from old.owner_id then
        raise exception 'owner_id cannot be changed';
    end if;

    if new.public_code is distinct from old.public_code then
        raise exception 'public_code cannot be changed';
    end if;

    new.updated_at := now();

    return new;

end;
$$;


drop trigger if exists
    root_smartcard_before_update
on
    public.smart_cards;


create trigger
    root_smartcard_before_update
before update
on public.smart_cards
for each row
execute function
    public.root_smartcard_before_update();
