import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const OLD_SUPABASE_URL =
    "https://onmrexiyhzyytmfwbvsr.supabase.co";


const OLD_SUPABASE_KEY =
    "sb_publishable_kFcJ3JeFtjagz0aa-r2WRA_hUUOT8uU";


const PLATFORM_ADMIN_EMAIL =
    "yousofhatim77@gmail.com";


const CUSTOMER_SITE_BASE =
    "https://yousofhatim77-dotcom.github.io/ROOT-SmartCard/site/?site=";


const SMART_LINK_BASE =
    "https://yousofhatim77-dotcom.github.io/ROOT-SmartCard/r/?c=";


const cors = {

    "Access-Control-Allow-Origin":
        "*",

    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",

    "Access-Control-Allow-Methods":
        "POST, OPTIONS"

};


function reply(
    body: unknown,
    status = 200
) {

    return new Response(
        JSON.stringify(
            body
        ),
        {
            status,

            headers: {
                ...cors,

                "Content-Type":
                    "application/json",

                "Cache-Control":
                    "no-store"
            }
        }
    );

}


function validHttpUrl(
    value: string
) {

    try {

        const parsed =
            new URL(
                value
            );


        return (
            parsed.protocol ===
                "http:"
            ||
            parsed.protocol ===
                "https:"
        );

    }
    catch {

        return false;

    }

}


function normalizeSlug(
    value: string
) {

    return String(
        value || ""
    )
    .trim()
    .toLowerCase();

}


function randomCardCode(
    length = 12
) {

    const alphabet =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    const bytes =
        new Uint8Array(
            length
        );


    crypto.getRandomValues(
        bytes
    );


    return Array
        .from(
            bytes,
            item =>
                alphabet[
                    item %
                    alphabet.length
                ]
        )
        .join("");

}


async function validatePlatformAdmin(
    req: Request
) {

    const authorization =
        req.headers.get(
            "authorization"
        ) || "";


    if (
        !authorization
            .toLowerCase()
            .startsWith(
                "bearer "
            )
    ) {

        return null;

    }


    const response =
        await fetch(
            `${OLD_SUPABASE_URL}/auth/v1/user`,
            {
                headers: {

                    apikey:
                        OLD_SUPABASE_KEY,

                    Authorization:
                        authorization
                }
            }
        );


    if (
        !response.ok
    ) {

        return null;

    }


    const user =
        await response
            .json()
            .catch(
                () => null
            );


    const email =
        String(
            user?.email ||
            ""
        )
        .trim()
        .toLowerCase();


    if (
        email !==
        PLATFORM_ADMIN_EMAIL
    ) {

        return null;

    }


    return user;

}


Deno.serve(
    async req => {

        if (
            req.method ===
            "OPTIONS"
        ) {

            return new Response(
                "ok",
                {
                    headers:
                        cors
                }
            );

        }


        if (
            req.method !==
            "POST"
        ) {

            return reply(
                {
                    error:
                        "METHOD_NOT_ALLOWED"
                },
                405
            );

        }


        const rootAdmin =
            await validatePlatformAdmin(
                req
            );


        if (
            !rootAdmin
        ) {

            return reply(
                {
                    error:
                        "PLATFORM_ADMIN_REQUIRED"
                },
                403
            );

        }


        const supabaseUrl =
            Deno.env.get(
                "SUPABASE_URL"
            );


        const serviceKey =
            Deno.env.get(
                "SUPABASE_SECRET_KEY"
            )
            ??
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            );


        if (
            !supabaseUrl ||
            !serviceKey
        ) {

            return reply(
                {
                    error:
                        "SERVER_NOT_CONFIGURED"
                },
                500
            );

        }


        const admin =
            createClient(
                supabaseUrl,
                serviceKey,
                {
                    auth: {

                        persistSession:
                            false,

                        autoRefreshToken:
                            false

                    }
                }
            );


        const body =
            await req
                .json()
                .catch(
                    () => ({})
                );


        const action =
            String(
                body?.action ||
                ""
            );


        // ====================================================
        // DASHBOARD DATA
        // ====================================================

        if (
            action ===
            "dashboard"
        ) {

            const [
                batchesResult,
                cardsResult,
                clientsResult,
                membersResult,
                usersResult
            ] =
                await Promise.all([

                    admin
                        .from(
                            "card_batches"
                        )
                        .select(
                            "id,name,default_destination_url,card_count,created_at"
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        )
                        .limit(
                            100
                        ),

                    admin
                        .from(
                            "smart_cards"
                        )
                        .select(
                            "id,public_code,label,destination_url,enabled,status,batch_id,client_id,owner_id,created_at,assigned_at"
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        )
                        .limit(
                            500
                        ),

                    admin
                        .from(
                            "clients"
                        )
                        .select(
                            "id,slug,display_name,active,created_at"
                        )
                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        ),

                    admin
                        .from(
                            "client_members"
                        )
                        .select(
                            "client_id,user_id,role,created_at"
                        ),

                    admin
                        .auth
                        .admin
                        .listUsers({
                            page:
                                1,

                            perPage:
                                1000
                        })

                ]);


            if (
                batchesResult.error
                ||
                cardsResult.error
                ||
                clientsResult.error
                ||
                membersResult.error
                ||
                usersResult.error
            ) {

                console.error({
                    batches:
                        batchesResult.error,

                    cards:
                        cardsResult.error,

                    clients:
                        clientsResult.error,

                    members:
                        membersResult.error,

                    users:
                        usersResult.error
                });


                return reply(
                    {
                        error:
                            "DASHBOARD_LOAD_FAILED"
                    },
                    500
                );

            }


            const users =
                usersResult
                    .data
                    ?.users ||
                [];


            const emailByUser =
                new Map(
                    users.map(
                        user => [
                            user.id,
                            user.email || ""
                        ]
                    )
                );


            const members =
                membersResult.data ||
                [];


            const clients =
                (
                    clientsResult.data ||
                    []
                )
                .map(
                    client => {

                        const owner =
                            members.find(
                                member =>
                                    member.client_id ===
                                        client.id
                                    &&
                                    member.role ===
                                        "owner"
                            );


                        return {

                            ...client,

                            owner_user_id:
                                owner?.user_id ||
                                null,

                            owner_email:
                                owner
                                    ? (
                                        emailByUser.get(
                                            owner.user_id
                                        ) ||
                                        ""
                                    )
                                    : ""

                        };

                    }
                );


            return reply({

                ok:
                    true,

                batches:
                    batchesResult.data ||
                    [],

                cards:
                    cardsResult.data ||
                    [],

                clients

            });

        }


        // ====================================================
        // GENERATE PRE-PRINTED BATCH
        // ====================================================

        if (
            action ===
            "generate_batch"
        ) {

            const count =
                Number(
                    body?.count
                );


            const name =
                String(
                    body?.name ||
                    ""
                )
                .trim()
                .slice(
                    0,
                    80
                );


            const destinationUrl =
                String(
                    body?.destination_url ||
                    ""
                )
                .trim();


            if (
                !Number.isInteger(
                    count
                )
                ||
                count < 1
                ||
                count > 200
            ) {

                return reply(
                    {
                        error:
                            "COUNT_MUST_BE_1_TO_200"
                    },
                    400
                );

            }


            if (
                !name
            ) {

                return reply(
                    {
                        error:
                            "BATCH_NAME_REQUIRED"
                    },
                    400
                );

            }


            if (
                !validHttpUrl(
                    destinationUrl
                )
            ) {

                return reply(
                    {
                        error:
                            "INVALID_DESTINATION"
                    },
                    400
                );

            }


            const {
                data:
                    batch,
                error:
                    batchError
            } =
                await admin
                    .from(
                        "card_batches"
                    )
                    .insert({

                        name,

                        default_destination_url:
                            destinationUrl,

                        card_count:
                            count

                    })
                    .select(
                        "id,name,default_destination_url,card_count,created_at"
                    )
                    .single();


            if (
                batchError ||
                !batch
            ) {

                console.error(
                    batchError
                );


                return reply(
                    {
                        error:
                            "BATCH_CREATE_FAILED"
                    },
                    500
                );

            }


            const used =
                new Set<string>();


            const cards:
                Record<string, unknown>[] =
                [];


            while (
                cards.length <
                count
            ) {

                const code =
                    randomCardCode();


                if (
                    used.has(
                        code
                    )
                ) {

                    continue;

                }


                used.add(
                    code
                );


                cards.push({

                    public_code:
                        code,

                    owner_id:
                        null,

                    client_id:
                        null,

                    batch_id:
                        batch.id,

                    status:
                        "unassigned",

                    label:
                        `${name} #${String(
                            cards.length + 1
                        ).padStart(
                            3,
                            "0"
                        )}`,

                    destination_url:
                        destinationUrl,

                    enabled:
                        true

                });

            }


            const {
                data:
                    createdCards,
                error:
                    cardsError
            } =
                await admin
                    .from(
                        "smart_cards"
                    )
                    .insert(
                        cards
                    )
                    .select(
                        "id,public_code,label,destination_url,status,batch_id,created_at"
                    );


            if (
                cardsError
            ) {

                console.error(
                    cardsError
                );


                await admin
                    .from(
                        "card_batches"
                    )
                    .delete()
                    .eq(
                        "id",
                        batch.id
                    );


                return reply(
                    {
                        error:
                            "CARD_BATCH_INSERT_FAILED"
                    },
                    500
                );

            }


            return reply({

                ok:
                    true,

                batch,

                cards:
                    (
                        createdCards ||
                        []
                    )
                    .map(
                        card => ({

                            ...card,

                            smart_link:
                                SMART_LINK_BASE +
                                card.public_code

                        })
                    )

            });

        }


        // ====================================================
        // CREATE CUSTOMER ACCOUNT
        // ====================================================

        if (
            action ===
            "create_customer"
        ) {

            const displayName =
                String(
                    body?.display_name ||
                    ""
                )
                .trim()
                .slice(
                    0,
                    100
                );


            const slug =
                normalizeSlug(
                    body?.slug
                );


            const email =
                String(
                    body?.email ||
                    ""
                )
                .trim()
                .toLowerCase();


            const password =
                String(
                    body?.password ||
                    ""
                );


            if (
                !displayName
                ||
                !/^[a-z0-9][a-z0-9-]{1,62}$/
                    .test(
                        slug
                    )
                ||
                !email.includes(
                    "@"
                )
                ||
                password.length <
                    8
            ) {

                return reply(
                    {
                        error:
                            "INVALID_CUSTOMER_DATA"
                    },
                    400
                );

            }


            const {
                data:
                    userResult,
                error:
                    userError
            } =
                await admin
                    .auth
                    .admin
                    .createUser({

                        email,

                        password,

                        email_confirm:
                            true,

                        user_metadata: {
                            display_name:
                                displayName
                        }

                    });


            if (
                userError ||
                !userResult.user
            ) {

                console.error(
                    userError
                );


                return reply(
                    {
                        error:
                            userError?.message ||
                            "USER_CREATE_FAILED"
                    },
                    409
                );

            }


            const user =
                userResult.user;


            const {
                data:
                    client,
                error:
                    clientError
            } =
                await admin
                    .from(
                        "clients"
                    )
                    .insert({

                        slug,

                        display_name:
                            displayName,

                        active:
                            true

                    })
                    .select(
                        "id,slug,display_name,active,created_at"
                    )
                    .single();


            if (
                clientError ||
                !client
            ) {

                console.error(
                    clientError
                );


                await admin
                    .auth
                    .admin
                    .deleteUser(
                        user.id
                    );


                return reply(
                    {
                        error:
                            clientError?.message ||
                            "CLIENT_CREATE_FAILED"
                    },
                    409
                );

            }


            const {
                error:
                    memberError
            } =
                await admin
                    .from(
                        "client_members"
                    )
                    .insert({

                        client_id:
                            client.id,

                        user_id:
                            user.id,

                        role:
                            "owner"

                    });


            if (
                memberError
            ) {

                console.error(
                    memberError
                );


                await admin
                    .from(
                        "clients"
                    )
                    .delete()
                    .eq(
                        "id",
                        client.id
                    );


                await admin
                    .auth
                    .admin
                    .deleteUser(
                        user.id
                    );


                return reply(
                    {
                        error:
                            "MEMBERSHIP_CREATE_FAILED"
                    },
                    500
                );

            }


            return reply({

                ok:
                    true,

                user: {
                    id:
                        user.id,

                    email:
                        user.email
                },

                client,

                site_url:
                    CUSTOMER_SITE_BASE +
                    encodeURIComponent(
                        client.slug
                    )

            });

        }


        // ====================================================
        // ASSIGN PRE-PRINTED CARD TO CUSTOMER
        // ====================================================

        if (
            action ===
            "assign_card"
        ) {

            const publicCode =
                String(
                    body?.public_code ||
                    ""
                )
                .trim()
                .toUpperCase();


            const clientId =
                String(
                    body?.client_id ||
                    ""
                )
                .trim();


            if (
                !/^[A-Z0-9]{8,32}$/
                    .test(
                        publicCode
                    )
                ||
                !clientId
            ) {

                return reply(
                    {
                        error:
                            "INVALID_ASSIGNMENT"
                    },
                    400
                );

            }


            const {
                data:
                    client,
                error:
                    clientError
            } =
                await admin
                    .from(
                        "clients"
                    )
                    .select(
                        "id,slug,display_name,active"
                    )
                    .eq(
                        "id",
                        clientId
                    )
                    .eq(
                        "active",
                        true
                    )
                    .maybeSingle();


            if (
                clientError ||
                !client
            ) {

                return reply(
                    {
                        error:
                            "CLIENT_NOT_FOUND"
                    },
                    404
                );

            }


            const {
                data:
                    memberships,
                error:
                    membershipError
            } =
                await admin
                    .from(
                        "client_members"
                    )
                    .select(
                        "user_id,role,created_at"
                    )
                    .eq(
                        "client_id",
                        client.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                true
                        }
                    );


            if (
                membershipError
            ) {

                return reply(
                    {
                        error:
                            "MEMBERSHIP_LOOKUP_FAILED"
                    },
                    500
                );

            }


            const owner =
                (
                    memberships ||
                    []
                )
                .find(
                    member =>
                        member.role ===
                            "owner"
                )
                ||
                (
                    memberships ||
                    []
                )[0];


            if (
                !owner
            ) {

                return reply(
                    {
                        error:
                            "CUSTOMER_HAS_NO_USER"
                    },
                    409
                );

            }


            const requestedDestination =
                String(
                    body?.destination_url ||
                    ""
                )
                .trim();


            const destinationUrl =
                requestedDestination ||
                (
                    CUSTOMER_SITE_BASE +
                    encodeURIComponent(
                        client.slug
                    )
                );


            if (
                !validHttpUrl(
                    destinationUrl
                )
            ) {

                return reply(
                    {
                        error:
                            "INVALID_DESTINATION"
                    },
                    400
                );

            }


            const {
                data:
                    card,
                error:
                    cardError
            } =
                await admin
                    .from(
                        "smart_cards"
                    )
                    .update({

                        owner_id:
                            owner.user_id,

                        client_id:
                            client.id,

                        status:
                            "assigned",

                        assigned_at:
                            new Date()
                                .toISOString(),

                        destination_url:
                            destinationUrl

                    })
                    .eq(
                        "public_code",
                        publicCode
                    )
                    .eq(
                        "status",
                        "unassigned"
                    )
                    .is(
                        "client_id",
                        null
                    )
                    .select(
                        "id,public_code,label,destination_url,status,client_id,owner_id,assigned_at"
                    )
                    .maybeSingle();


            if (
                cardError
            ) {

                console.error(
                    cardError
                );


                return reply(
                    {
                        error:
                            "CARD_ASSIGN_FAILED"
                    },
                    500
                );

            }


            if (
                !card
            ) {

                return reply(
                    {
                        error:
                            "CARD_NOT_AVAILABLE"
                    },
                    409
                );

            }


            return reply({

                ok:
                    true,

                card,

                client

            });

        }


        return reply(
            {
                error:
                    "UNKNOWN_ACTION"
            },
            400
        );

    }
);