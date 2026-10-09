-- ============================================================
-- ROOT SmartCard
-- Pre-generated inventory + later customer assignment
-- ============================================================


create table if not exists public.card_batches (

    id uuid
        primary key
        default gen_random_uuid(),

    name text
        not null,

    default_destination_url text
        not null
        check (
            default_destination_url ~* '^https?://'
        ),

    card_count integer
        not null
        check (
            card_count between 1 and 1000
        ),

    created_at timestamptz
        not null
        default now()

);


alter table public.card_batches
enable row level security;



-- ============================================================
-- SMART CARDS CAN EXIST BEFORE A CUSTOMER EXISTS
-- ============================================================

alter table public.smart_cards
alter column owner_id
drop not null;


alter table public.smart_cards
drop constraint if exists
    smart_cards_owner_id_fkey;


alter table public.smart_cards
add constraint
    smart_cards_owner_id_fkey
foreign key (
    owner_id
)
references auth.users(id)
on delete set null;


alter table public.smart_cards
drop constraint if exists
    smart_cards_client_id_fkey;


alter table public.smart_cards
add constraint
    smart_cards_client_id_fkey
foreign key (
    client_id
)
references public.clients(id)
on delete set null;



alter table public.smart_cards
add column if not exists
    batch_id uuid
    references public.card_batches(id)
    on delete set null;


alter table public.smart_cards
add column if not exists
    status text;


alter table public.smart_cards
add column if not exists
    assigned_at timestamptz;



update public.smart_cards
set
    status =
        case

            when client_id is null
                then 'unassigned'

            else
                'assigned'

        end
where
    status is null;


alter table public.smart_cards
alter column status
set default 'unassigned';


alter table public.smart_cards
alter column status
set not null;


alter table public.smart_cards
drop constraint if exists
    smart_cards_status_check;


alter table public.smart_cards
add constraint
    smart_cards_status_check
check (
    status in (
        'unassigned',
        'assigned',
        'disabled'
    )
);


create index if not exists
    smart_cards_batch_id_idx
on
    public.smart_cards(batch_id);


create index if not exists
    smart_cards_status_idx
on
    public.smart_cards(status);



-- ============================================================
-- PUBLIC CODE IS PERMANENT
-- OWNER / CLIENT MAY CHANGE ONLY THROUGH PLATFORM BACKEND
-- ============================================================

create or replace function
public.root_smartcard_before_update()
returns trigger
language plpgsql
set search_path = public
as $$

begin

    if
        new.public_code
        is distinct from
        old.public_code
    then

        raise exception
            'public_code cannot be changed';

    end if;


    new.updated_at :=
        now();


    return new;

end;

$$;



-- ============================================================
-- CUSTOMERS:
-- READ ASSIGNED CARDS
-- CHANGE SAFE FIELDS ONLY
-- CANNOT CREATE / DELETE INVENTORY
-- ============================================================

drop policy if exists
    "client members create cards"
on public.smart_cards;


drop policy if exists
    "client members delete cards"
on public.smart_cards;


drop policy if exists
    "client members update cards"
on public.smart_cards;


drop policy if exists
    "client members read cards"
on public.smart_cards;



create policy
    "client members read assigned cards"
on public.smart_cards
for select
to authenticated
using (

    status =
        'assigned'

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
    "client members update assigned cards"
on public.smart_cards
for update
to authenticated
using (

    status =
        'assigned'

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

)
with check (

    status =
        'assigned'

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



revoke insert
on public.smart_cards
from authenticated;


revoke delete
on public.smart_cards
from authenticated;


revoke update
on public.smart_cards
from authenticated;


grant select
on public.smart_cards
to authenticated;


grant update (
    label,
    destination_url,
    enabled
)
on public.smart_cards
to authenticated;
