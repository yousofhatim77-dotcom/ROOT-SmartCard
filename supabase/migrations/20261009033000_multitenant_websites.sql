-- ============================================================
-- ROOT SmartCard - Multi Tenant Website Platform
-- ============================================================


create table if not exists public.clients (

    id uuid
        primary key
        default gen_random_uuid(),

    slug text
        not null
        unique
        check (
            slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'
        ),

    display_name text
        not null,

    active boolean
        not null
        default true,

    created_at timestamptz
        not null
        default now()

);


create table if not exists public.client_members (

    client_id uuid
        not null
        references public.clients(id)
        on delete cascade,

    user_id uuid
        not null
        references auth.users(id)
        on delete cascade,

    role text
        not null
        default 'owner'
        check (
            role in (
                'owner',
                'admin',
                'editor'
            )
        ),

    created_at timestamptz
        not null
        default now(),

    primary key (
        client_id,
        user_id
    )

);


alter table public.clients
enable row level security;


alter table public.client_members
enable row level security;


drop policy if exists
    "members read memberships"
on public.client_members;


create policy
    "members read memberships"
on public.client_members
for select
to authenticated
using (
    user_id =
    auth.uid()
);


drop policy if exists
    "members read client"
on public.clients;


create policy
    "members read client"
on public.clients
for select
to authenticated
using (

    active = true

    and

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                clients.id

        and
            m.user_id =
                auth.uid()

    )

);


create or replace function
public.can_manage_client_slug(
    p_slug text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$

    select exists (

        select
            1

        from
            public.clients c

        join
            public.client_members m

        on
            m.client_id =
                c.id

        where
            c.slug =
                p_slug

        and
            c.active =
                true

        and
            m.user_id =
                auth.uid()

    );

$$;


revoke all
on function
    public.can_manage_client_slug(text)
from public;


grant execute
on function
    public.can_manage_client_slug(text)
to authenticated;


-- ============================================================
-- PUBLIC SITE STORAGE
-- ============================================================

insert into storage.buckets (
    id,
    name,
    public
)
values (
    'root-smartcard-sites',
    'root-smartcard-sites',
    true
)
on conflict (
    id
)
do update
set
    public =
        true;


drop policy if exists
    "public read smartcard sites"
on storage.objects;


create policy
    "public read smartcard sites"
on storage.objects
for select
to anon, authenticated
using (
    bucket_id =
        'root-smartcard-sites'
);


drop policy if exists
    "members insert smartcard sites"
on storage.objects;


create policy
    "members insert smartcard sites"
on storage.objects
for insert
to authenticated
with check (

    bucket_id =
        'root-smartcard-sites'

    and

    (storage.foldername(name))[1] =
        'clients'

    and

    public.can_manage_client_slug(
        (storage.foldername(name))[2]
    )

);


drop policy if exists
    "members update smartcard sites"
on storage.objects;


create policy
    "members update smartcard sites"
on storage.objects
for update
to authenticated
using (

    bucket_id =
        'root-smartcard-sites'

    and

    (storage.foldername(name))[1] =
        'clients'

    and

    public.can_manage_client_slug(
        (storage.foldername(name))[2]
    )

)
with check (

    bucket_id =
        'root-smartcard-sites'

    and

    (storage.foldername(name))[1] =
        'clients'

    and

    public.can_manage_client_slug(
        (storage.foldername(name))[2]
    )

);


drop policy if exists
    "members delete smartcard sites"
on storage.objects;


create policy
    "members delete smartcard sites"
on storage.objects
for delete
to authenticated
using (

    bucket_id =
        'root-smartcard-sites'

    and

    (storage.foldername(name))[1] =
        'clients'

    and

    public.can_manage_client_slug(
        (storage.foldername(name))[2]
    )

);


-- ============================================================
-- CONNECT SMART CARDS TO CLIENTS
-- ============================================================

alter table public.smart_cards

add column if not exists
    client_id uuid
    references public.clients(id)
    on delete cascade;


create index if not exists
    smart_cards_client_id_idx
on
    public.smart_cards(client_id);


drop policy if exists
    "owners read own cards"
on public.smart_cards;


drop policy if exists
    "owners create own cards"
on public.smart_cards;


drop policy if exists
    "owners update own cards"
on public.smart_cards;


drop policy if exists
    "owners delete own cards"
on public.smart_cards;


create policy
    "client members read cards"
on public.smart_cards
for select
to authenticated
using (

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                smart_cards.client_id

        and
            m.user_id =
                auth.uid()

    )

);


create policy
    "client members create cards"
on public.smart_cards
for insert
to authenticated
with check (

    owner_id =
        auth.uid()

    and

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                smart_cards.client_id

        and
            m.user_id =
                auth.uid()

    )

);


create policy
    "client members update cards"
on public.smart_cards
for update
to authenticated
using (

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                smart_cards.client_id

        and
            m.user_id =
                auth.uid()

    )

)
with check (

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                smart_cards.client_id

        and
            m.user_id =
                auth.uid()

    )

);


create policy
    "client members delete cards"
on public.smart_cards
for delete
to authenticated
using (

    exists (

        select
            1

        from
            public.client_members m

        where
            m.client_id =
                smart_cards.client_id

        and
            m.user_id =
                auth.uid()

    )

);


grant select
on public.smart_cards
to authenticated;


grant insert
on public.smart_cards
to authenticated;


grant delete
on public.smart_cards
to authenticated;


grant update (
    label,
    destination_url,
    enabled
)
on public.smart_cards
to authenticated;


-- ============================================================
-- FIRST TEST CLIENT
-- ============================================================

insert into public.clients (
    slug,
    display_name,
    active
)
values (
    'test-lab',
    'Test Lab',
    true
)
on conflict (
    slug
)
do update
set
    display_name =
        excluded.display_name,
    active =
        true;


insert into public.client_members (
    client_id,
    user_id,
    role
)
select
    id,
    '0dbee1cf-bd46-4ebe-ab47-f3fe7c64f247'::uuid,
    'owner'
from
    public.clients
where
    slug =
        'test-lab'
on conflict (
    client_id,
    user_id
)
do update
set
    role =
        'owner';


update public.smart_cards sc
set
    client_id =
        c.id
from
    public.clients c
where
    c.slug =
        'test-lab'

and
    sc.owner_id =
        '0dbee1cf-bd46-4ebe-ab47-f3fe7c64f247'::uuid

and
    sc.client_id
        is null;
