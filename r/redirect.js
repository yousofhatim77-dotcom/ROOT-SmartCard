(async () => {

const cfg =
    window.ROOT_SMARTCARD_CONFIG;


const status =
    document.getElementById(
        "status"
    );


const code =
    new URLSearchParams(
        location.search
    )
    .get(
        "c"
    );


if (!code) {

    status.textContent =
        "Invalid card link.";

    return;

}


try {

    const endpoint =

        cfg.supabaseUrl
            .replace(
                /\/$/,
                ""
            )

        +

        "/functions/v1/"

        +

        encodeURIComponent(
            cfg.redirectFunctionName
        )

        +

        "?c="

        +

        encodeURIComponent(
            code
        );


    const response =
        await fetch(
            endpoint,
            {
                method:
                    "GET",

                headers: {
                    apikey:
                        cfg.supabasePublishableKey
                },

                cache:
                    "no-store"
            }
        );


    const data =
        await response
            .json()
            .catch(
                () => ({})
            );


    if (
        !response.ok ||
        !data.url
    ) {

        throw new Error(
            data.error ||
            "Card unavailable"
        );

    }


    const destination =
        new URL(
            data.url
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

        throw new Error(
            "Invalid destination"
        );

    }


    location.replace(
        destination.toString()
    );

}
catch (error) {

    status.textContent =
        error.message ||
        "Unable to open card.";

}

})();