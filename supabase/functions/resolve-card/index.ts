import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "GET, OPTIONS"
};


function reply(
    body: unknown,
    status = 200
) {

    return new Response(
        JSON.stringify(body),
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
            "GET"
        ) {

            return reply(
                {
                    error:
                        "METHOD_NOT_ALLOWED"
                },
                405
            );

        }


        const requestUrl =
            new URL(
                req.url
            );


        const code =
            (
                requestUrl.searchParams
                    .get("c") ||
                ""
            )
            .trim()
            .toUpperCase();


        if (
            !/^[A-Z0-9]{8,32}$/
                .test(code)
        ) {

            return reply(
                {
                    error:
                        "INVALID_CARD"
                },
                400
            );

        }


        const supabaseUrl =
            Deno.env.get(
                "SUPABASE_URL"
            );


        const serverKey =
            Deno.env.get(
                "SUPABASE_SECRET_KEY"
            ) ??
            Deno.env.get(
                "SUPABASE_SERVICE_ROLE_KEY"
            );


        if (
            !supabaseUrl ||
            !serverKey
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
                serverKey,
                {
                    auth: {
                        persistSession:
                            false,
                        autoRefreshToken:
                            false
                    }
                }
            );


        const {
            data,
            error
        } =
            await admin
                .from(
                    "smart_cards"
                )
                .select(
                    "destination_url,enabled"
                )
                .eq(
                    "public_code",
                    code
                )
                .maybeSingle();


        if (error) {

            console.error(error);

            return reply(
                {
                    error:
                        "LOOKUP_FAILED"
                },
                500
            );

        }


        if (
            !data ||
            !data.enabled
        ) {

            return reply(
                {
                    error:
                        "CARD_NOT_FOUND"
                },
                404
            );

        }


        try {

            const destination =
                new URL(
                    data.destination_url
                );


            if (
                ![
                    "http:",
                    "https:"
                ]
                .includes(
                    destination.protocol
                )
            ) {

                return reply(
                    {
                        error:
                            "INVALID_DESTINATION"
                    },
                    500
                );

            }


            return reply({
                url:
                    destination.toString()
            });

        }
        catch {

            return reply(
                {
                    error:
                        "INVALID_DESTINATION"
                },
                500
            );

        }

    }
);