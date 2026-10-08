(() => {

const cfg =
    window.ROOT_SMARTCARD_CONFIG;


const loginView =
    document.getElementById(
        'loginView'
    );


const dashboardView =
    document.getElementById(
        'dashboardView'
    );


const cardsElement =
    document.getElementById(
        'cards'
    );


const logoutBtn =
    document.getElementById(
        'logoutBtn'
    );


if (
    !cfg.supabaseUrl.startsWith(
        'https://'
    ) ||
    cfg.supabasePublishableKey
        .startsWith(
            'PASTE_'
        )
) {

    const warning =
        document.getElementById(
            'configWarning'
        );

    warning.textContent =
        'Supabase is not configured yet.';

    warning.classList.remove(
        'hidden'
    );

    return;

}


const supabase =
    window.supabase.createClient(

        cfg.supabaseUrl,

        cfg.supabasePublishableKey

    );


function smartUrl(
    code
) {

    return (

        cfg.siteBaseUrl
            .replace(
                /\/$/,
                ''
            )

        +

        '/r/?c='

        +

        encodeURIComponent(
            code
        )

    );

}


function randomCode() {

    const alphabet =
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';


    const bytes =
        new Uint8Array(
            12
        );


    crypto.getRandomValues(
        bytes
    );


    return Array
        .from(
            bytes,
            byte =>
                alphabet[
                    byte %
                    alphabet.length
                ]
        )
        .join('');

}


async function loadCards() {

    cardsElement.innerHTML =
        '';


    const {
        data,
        error
    } =
        await supabase
            .from(
                'smart_cards'
            )
            .select(
                '*'
            )
            .order(
                'created_at',
                {
                    ascending:
                        false
                }
            );


    if (error) {

        cardsElement.textContent =
            error.message;

        return;

    }


    for (
        const card
        of
        data
    ) {

        renderCard(
            card
        );

    }

}


function renderCard(
    card
) {

    const wrapper =
        document.createElement(
            'article'
        );


    wrapper.className =
        'card';


    const title =
        document.createElement(
            'h2'
        );


    title.textContent =
        card.label;


    const code =
        document.createElement(
            'div'
        );


    code.className =
        'muted';


    code.textContent =
        card.public_code;


    const qr =
        document.createElement(
            'div'
        );


    qr.className =
        'qr';


    new QRCode(
        qr,
        {
            text:
                smartUrl(
                    card.public_code
                ),

            width:
                170,

            height:
                170,

            correctLevel:
                QRCode.CorrectLevel.H
        }
    );


    const smart =
        document.createElement(
            'div'
        );


    smart.className =
        'smart-link';


    smart.textContent =
        smartUrl(
            card.public_code
        );


    const destination =
        document.createElement(
            'input'
        );


    destination.type =
        'url';


    destination.value =
        card.destination_url;


    const actions =
        document.createElement(
            'div'
        );


    actions.className =
        'card-actions';


    const save =
        document.createElement(
            'button'
        );


    save.className =
        'btn primary';


    save.textContent =
        'Save destination';


    save.onclick =
        async () => {

            let value;

            try {

                const parsed =
                    new URL(
                        destination.value
                    );


                if (
                    ![
                        'http:',
                        'https:'
                    ]
                    .includes(
                        parsed.protocol
                    )
                ) {

                    throw new Error(
                        'Invalid URL'
                    );

                }


                value =
                    parsed.toString();

            }
            catch {

                alert(
                    'Invalid URL'
                );

                return;

            }


            const {
                error
            } =
                await supabase
                    .from(
                        'smart_cards'
                    )
                    .update({
                        destination_url:
                            value
                    })
                    .eq(
                        'id',
                        card.id
                    );


            if (error) {

                alert(
                    error.message
                );

                return;

            }


            save.textContent =
                'Saved';


            setTimeout(
                () =>
                    save.textContent =
                        'Save destination',
                1200
            );

        };


    const copy =
        document.createElement(
            'button'
        );


    copy.className =
        'btn';


    copy.textContent =
        'Copy smart link';


    copy.onclick =
        async () => {

            await navigator.clipboard
                .writeText(
                    smartUrl(
                        card.public_code
                    )
                );

            copy.textContent =
                'Copied';

            setTimeout(
                () =>
                    copy.textContent =
                        'Copy smart link',
                1200
            );

        };


    actions.append(
        save,
        copy
    );


    wrapper.append(
        title,
        code,
        qr,
        smart,
        destination,
        actions
    );


    cardsElement.append(
        wrapper
    );

}


document
    .getElementById(
        'loginForm'
    )
    .addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        'email'
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        'password'
                    )
                    .value;


            const {
                error
            } =
                await supabase
                    .auth
                    .signInWithPassword({
                        email,
                        password
                    });


            if (error) {

                document
                    .getElementById(
                        'loginStatus'
                    )
                    .textContent =
                        error.message;

            }

        }
    );


document
    .getElementById(
        'createForm'
    )
    .addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            const {
                data
            } =
                await supabase
                    .auth
                    .getUser();


            if (
                !data.user
            ) {

                return;

            }


            const cardName =
                document
                    .getElementById(
                        'cardName'
                    )
                    .value
                    .trim();


            const destination =
                new URL(

                    document
                        .getElementById(
                            'destinationUrl'
                        )
                        .value

                )
                .toString();


            const {
                error
            } =
                await supabase
                    .from(
                        'smart_cards'
                    )
                    .insert({

                        owner_id:
                            data.user.id,

                        public_code:
                            randomCode(),

                        label:
                            cardName,

                        destination_url:
                            destination

                    });


            if (error) {

                document
                    .getElementById(
                        'createStatus'
                    )
                    .textContent =
                        error.message;

                return;

            }


            event.target.reset();


            document
                .getElementById(
                    'createStatus'
                )
                .textContent =
                    'Card created successfully.';


            await loadCards();

        }
    );


logoutBtn.onclick =
    () =>
        supabase
            .auth
            .signOut();


async function updateSession(
    session
) {

    const logged =
        Boolean(
            session?.user
        );


    loginView
        .classList
        .toggle(
            'hidden',
            logged
        );


    dashboardView
        .classList
        .toggle(
            'hidden',
            !logged
        );


    logoutBtn
        .classList
        .toggle(
            'hidden',
            !logged
        );


    if (
        logged
    ) {

        await loadCards();

    }

}


supabase
    .auth
    .onAuthStateChange(
        (
            _event,
            session
        ) => {

            updateSession(
                session
            );

        }
    );


supabase
    .auth
    .getSession()
    .then(
        ({
            data
        }) =>
            updateSession(
                data.session
            )
    );

})();
