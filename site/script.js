// ============================================================
// SUPABASE CONFIG
// ============================================================

const SUPABASE_URL =
    'https://fjvgsfqipiabwiliqygs.supabase.co';

const SUPABASE_ANON_KEY =
    'sb_publishable_xS7bZ6d7N7-532PLuAnX7w_ESAGf0zA';

const ROOT_ASSET_VERSION =
    Date.now();

const SUPABASE_BUCKET =
    'root-smartcard-sites';

const SUPABASE_HEADERS = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};


// ============================================================
// STORAGE PATHS
// ============================================================

const TENANT_QUERY_SLUG =
    String(
        new URLSearchParams(
            window.location.search
        ).get('site') || 'test-lab'
    )
    .trim()
    .toLowerCase();


const TENANT_SLUG =
    /^[a-z0-9][a-z0-9-]{1,62}$/
        .test(
            TENANT_QUERY_SLUG
        )
        ? TENANT_QUERY_SLUG
        : 'test-lab';


const TENANT_ROOT =
    `clients/${TENANT_SLUG}`;


const PORTFOLIO_ROOT =
    `${TENANT_ROOT}/portfolio`;


const PRICING_ROOT =
    `${TENANT_ROOT}/pricing`;


const GENERAL_PHOTOS_ROOT =
    `${TENANT_ROOT}/General photos`;


const ABOUT_IMAGE_PATH =
    `${GENERAL_PHOTOS_ROOT}/abute us.png`;


const LAB_LOGO_PATH =
    `${GENERAL_PHOTOS_ROOT}/H EL M.png`;


const AUDIO_PATH =
    `${TENANT_ROOT}/audio/background-music.mp3`;



/* ============================================================
   ROOT PUBLIC SITE CONFIG V8
   ============================================================ */

const SITE_CONFIG_PATH =
    `${TENANT_ROOT}/config/site.json`;


const DEFAULT_PUBLIC_SITE_CONFIG = {

    brandName:
        'ROOT dent',

    browserTitle:
        'ROOT dent',

    navProducts:
        'منتجاتنا',

    navAbout:
        'شعارنا',

    navPricing:
        'قائمة الأسعار',

    facebookLabel:
        'فيسبوك',

    facebookUrl:
        'https://www.facebook.com/profile.php?id=61593184389536',

    whatsappLabel:
        'واتساب',

    whatsappNumber:
        '201040296832',

    phoneLabel:
        '01040296832',

    phoneNumber:
        '+201040296832'

};


let publicSiteConfig = {
    ...DEFAULT_PUBLIC_SITE_CONFIG
};


function replaceLinkText(
    link,
    text
) {

    if (
        !link
    ) {
        return;
    }


    const icon =
        link.querySelector(
            'i'
        );


    [
        ...link.childNodes
    ]
    .forEach(
        node => {

            if (
                node !==
                icon
            ) {

                node.remove();

            }

        }
    );


    link.appendChild(
        document.createTextNode(
            ` ${text}`
        )
    );

}


function applyPublicSiteConfig() {

    const config =
        publicSiteConfig;


    if (
        config.browserTitle
    ) {

        document.title =
            config.browserTitle;

    }


    const productsButton =
        document.getElementById(
            'navProductsBtn'
        );


    const aboutButton =
        document.getElementById(
            'navAboutBtn'
        );


    const pricingButton =
        document.getElementById(
            'navPricingBtn'
        );


    if (
        productsButton
    ) {

        productsButton.textContent =
            config.navProducts ||
            'منتجاتنا';

    }


    if (
        aboutButton
    ) {

        aboutButton.textContent =
            config.navAbout ||
            'شعارنا';

    }


    if (
        pricingButton
    ) {

        pricingButton.textContent =
            config.navPricing ||
            'قائمة الأسعار';

    }


    const logoImage =
        document.querySelector(
            '#labLogo img'
        );


    if (
        logoImage
    ) {

        logoImage.alt =
            `شعار ${config.brandName || 'ROOT dent'}`;

    }


    const facebookLink =
        document.querySelector(
            'a[href*="facebook.com"]'
        );


    if (
        facebookLink
    ) {

        if (
            config.facebookUrl
        ) {

            facebookLink.href =
                config.facebookUrl;

        }


        replaceLinkText(
            facebookLink,
            config.facebookLabel ||
            'فيسبوك'
        );

    }


    const whatsappLink =
        document.querySelector(
            'a[href*="wa.me"]'
        );


    if (
        whatsappLink
    ) {

        const whatsappNumber =
            String(
                config.whatsappNumber ||
                ''
            )
            .replace(
                /\D/g,
                ''
            );


        if (
            whatsappNumber
        ) {

            whatsappLink.href =
                `https://wa.me/${whatsappNumber}`;

        }


        replaceLinkText(
            whatsappLink,
            config.whatsappLabel ||
            'واتساب'
        );

    }


    const phoneLink =
        document.querySelector(
            'a[href^="tel:"]'
        );


    if (
        phoneLink
    ) {

        if (
            config.phoneNumber
        ) {

            phoneLink.href =
                `tel:${config.phoneNumber}`;

        }


        replaceLinkText(
            phoneLink,
            config.phoneLabel ||
            config.phoneNumber ||
            'اتصال'
        );

    }

}


async function loadPublicSiteConfig() {

    try {

        const response =
            await fetch(
                storageUrl(
                    SITE_CONFIG_PATH
                ),
                {
                    cache:
                        'no-store'
                }
            );


        if (
            response.ok
        ) {

            const data =
                await response.json();


            publicSiteConfig = {
                ...DEFAULT_PUBLIC_SITE_CONFIG,
                ...data
            };

        }

    }

    catch (error) {

        console.warn(
            'Site config load failed:',
            error
        );

    }


    applyPublicSiteConfig();

}

/* ROOT PUBLIC SITE CONFIG V8 END */

// ============================================================
// CACHE / STATE
// ============================================================

let projectsData = [];
let pricingData = [];

let projectsLoaded = false;
let pricingLoaded = false;

let currentProjectId = null;
let currentProjectData = null;

let currentLogoPosition = 'left';
let isMusicPlaying = false;


// ============================================================
// VIEWER STATE
// ============================================================

let viewerImages = [];
let viewerIndex = 0;

let viewerZoom = 1;

let viewerDragging = false;

let viewerDragStart = {
    x: 0,
    y: 0
};

let viewerOffset = {
    x: 0,
    y: 0
};

let viewerInitialized = false;


// ============================================================
// DOM REFERENCES
// ============================================================

const heroGrid =
    document.getElementById(
        'heroGrid'
    );

const pricingScrollContainer =
    document.getElementById(
        'pricingScrollContainer'
    );

const pricingScrollTrack =
    document.getElementById(
        'pricingScrollTrack'
    );

const pricingScrollWrapper =
    document.getElementById(
        'pricingScrollWrapper'
    );

const projectModal =
    document.getElementById(
        'projectModal'
    );

const projectModalBody =
    document.getElementById(
        'projectModalBody'
    );

const projectModalTitle =
    document.getElementById(
        'projectModalTitle'
    );

const labLogo =
    document.getElementById(
        'labLogo'
    );

const musicControl =
    document.getElementById(
        'musicControl'
    );

const backgroundMusic =
    document.getElementById(
        'backgroundMusic'
    );


// ============================================================
// GENERAL HELPERS
// ============================================================

function showOverlay(element) {

    if (!element) {
        return;
    }

    element.style.display = 'flex';
}


function hideOverlay(element) {

    if (!element) {
        return;
    }

    element.style.display = 'none';
}


function escapeHtml(value) {

    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function encodePath(path) {

    return String(path || '')
        .split('/')
        .map(
            part =>
                encodeURIComponent(part)
        )
        .join('/');
}


function storageUrl(path) {

    if (!path) {
        return '';
    }


    if (
        /^https?:\/\//i.test(path)
    ) {

        return path;

    }


    return (
        `${SUPABASE_URL}` +
        `/storage/v1/object/public/` +
        `${SUPABASE_BUCKET}/` +
        encodePath(path) + '?v=' + ROOT_ASSET_VERSION
    );
}


function extensionOf(name) {

    const match =
        String(name || '')
            .toLowerCase()
            .match(
                /\.([a-z0-9]+)$/
            );


    return match
        ? match[1]
        : '';
}


function mediaTypeFromName(name) {

    const ext =
        extensionOf(name);


    if (
        [
            'jpg',
            'jpeg',
            'png',
            'webp',
            'gif',
            'bmp',
            'avif',
            'svg'
        ].includes(ext)
    ) {

        return 'image';

    }


    if (
        [
            'mp4',
            'webm',
            'ogg',
            'mov',
            'm4v',
            'avi'
        ].includes(ext)
    ) {

        return 'video';

    }


    if (
        ext === 'pdf'
    ) {

        return 'pdf';

    }


    if (
        [
            'mp3',
            'wav',
            'm4a',
            'aac',
            'flac'
        ].includes(ext)
    ) {

        return 'audio';

    }


    return 'file';
}


function isFolder(item) {

    return (
        item &&
        !item.id &&
        !item.metadata
    );
}


function sortItems(items) {

    return [...items].sort(
        (a, b) => {

            return String(
                a?.name || ''
            ).localeCompare(
                String(
                    b?.name || ''
                ),
                undefined,
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );

        }
    );
}


function displayName(name) {

    const value =
        String(name || '')
            .trim();


    if (!value) {
        return 'بدون اسم';
    }


    return value
        .replace(
            /[-_]+/g,
            ' '
        )
        .replace(
            /\s+/g,
            ' '
        )
        .trim();
}


function mediaDescription(filename) {

    if (!filename) {
        return '';
    }


    return String(filename)
        .replace(
            /\.[^/.]+$/,
            ''
        )
        .replace(
            /[-_]+/g,
            ' '
        )
        .replace(
            /\s+/g,
            ' '
        )
        .trim();
}


// ============================================================
// STORAGE
// ============================================================

async function listStorage(
    prefix = ''
) {

    const body = {

        prefix,

        limit: 1000,

        offset: 0,

        sortBy: {
            column: 'name',
            order: 'asc'
        }

    };


    const response =
        await fetch(
            `${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_BUCKET}`,
            {
                method: 'POST',

                headers:
                    SUPABASE_HEADERS,

                body:
                    JSON.stringify(
                        body
                    )
            }
        );


    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            `Supabase Storage ${response.status}: ${text}`
        );
    }


    const data =
        await response.json();


    return Array.isArray(data)
        ? data
        : [];
}


// ============================================================
// RECURSIVE STORAGE READER
// ============================================================

async function listAllFilesRecursively(
    prefix = ''
) {

    const result = [];

    const items =
        sortItems(
            await listStorage(
                prefix
            )
        );


    for (
        const item of items
    ) {

        const currentPath =
            prefix
                ? `${prefix}/${item.name}`
                : item.name;


        if (
            isFolder(item)
        ) {

            const nested =
                await listAllFilesRecursively(
                    currentPath
                );


            result.push(
                ...nested
            );

        }

        else {

            result.push({

                ...item,

                path:
                    currentPath,

                url:
                    storageUrl(
                        currentPath
                    ),

                type:
                    mediaTypeFromName(
                        item.name
                    )

            });

        }

    }


    return result;
}


// ============================================================
// PROJECT LOADER
// STRUCTURE:
//
// portfolio/
//   project-name/
//      cover/
//          cover.png
//      media/
//          image.jpg
//          another-image.png
// ============================================================


/* ============================================================
   ROOT PUBLIC MEDIA CAPTIONS V11
   ============================================================ */

const PROJECT_MEDIA_TEXTS_FILE =
    'media-texts.json';


async function loadPublicProjectMediaTexts(
    projectPath
) {

    try {

        const response =
            await fetch(
                storageUrl(
                    `${projectPath}/${PROJECT_MEDIA_TEXTS_FILE}`
                ),
                {
                    cache:
                        'no-store'
                }
            );


        if (
            !response.ok
        ) {

            return {};

        }


        const data =
            await response.json();


        if (
            !data ||
            typeof data !==
                'object' ||
            Array.isArray(
                data
            )
        ) {

            return {};

        }


        return data;

    }

    catch {

        return {};

    }

}

/* ROOT PUBLIC MEDIA CAPTIONS V11 END */

async function fetchProjectsFromStorage() {

    const rootItems =
        sortItems(
            await listStorage(
                PORTFOLIO_ROOT
            )
        );


    const projectFolders =
        rootItems.filter(
            item =>
                isFolder(item)
        );


    /*
     * نقرأ المشاريع بالتوازي.
     */

    const projects =
        await Promise.all(

            projectFolders.map(
                async (
                    folder,
                    index
                ) => {

                    const projectName =
                        folder.name;


                    const projectPath =
                        `${PORTFOLIO_ROOT}/${projectName}`;


                    /*
                     * نقرأ محتويات فولدر المشروع
                     */

                    const children =
                        await listStorage(
                            projectPath
                        );


                    /*
                     * COVER ثابت:
                     *
                     * project/cover/cover.png
                     */

                    const coverPath =
                        `${projectPath}/cover/cover.png`;


                    const coverUrl =
                        storageUrl(
                            coverPath
                        );


                    /*
                     * MEDIA FOLDER
                     */

                    const mediaFolder =
                        children.find(
                            item =>
                                isFolder(item) &&
                                String(
                                    item.name
                                )
                                    .toLowerCase()
                                    ===
                                    'media'
                        );


                    /* ROOT PROJECT CAPTION MAP V11 */

                    const projectMediaTexts =
                        await loadPublicProjectMediaTexts(
                            projectPath
                        );

                    let media = [];


                    if (
                        mediaFolder
                    ) {

                        const mediaPath =
                            `${projectPath}/${mediaFolder.name}`;


                        const mediaFiles =
                            sortItems(
                                await listStorage(
                                    mediaPath
                                )
                            );


                        media =
                            mediaFiles
                                .filter(
                                    item =>
                                        !isFolder(item)
                                )
                                .map(
                                    item => {

                                        const fullPath =
                                            `${mediaPath}/${item.name}`;


                                        return {

                                            name:
                                                item.name,

                                            description:
                                                (
                                                    /* ROOT CUSTOM MEDIA DESCRIPTION V11 */
                                                    projectMediaTexts[
                                                        item.name
                                                    ]
                                                    ||
                                                    mediaDescription(
                                                        item.name
                                                    )
                                                ),

                                            path:
                                                fullPath,

                                            url:
                                                storageUrl(
                                                    fullPath
                                                ),

                                            type:
                                                mediaTypeFromName(
                                                    item.name
                                                )

                                        };

                                    }
                                );

                    }


                    return {

                        id:
                            projectPath,

                        name:
                            displayName(
                                projectName
                            ),

                        folderName:
                            projectName,

                        path:
                            projectPath,

                        order:
                            index,

                        cover:
                            coverUrl,

                        coverPath:
                            coverPath,

                        media:
                            media

                    };

                }
            )
        );


    return projects;
}


async function ensureProjectsLoaded() {

    if (
        projectsLoaded
    ) {

        return;

    }


    projectsData =
        await fetchProjectsFromStorage();


    projectsLoaded =
        true;
}


// ============================================================
// PROJECT CARDS
// ============================================================

function renderProjects() {

    if (!heroGrid) {
        return;
    }


    heroGrid.innerHTML =
        '';


    if (
        !projectsData.length
    ) {

        heroGrid.innerHTML = `

            <div
                class="empty-hint"
                style="grid-column:1/-1;"
            >

                <i
                    class="fas fa-images"
                ></i>

                <p>
                    لا توجد مشاريع لعرضها
                </p>

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    projectsData.forEach(
        project => {

            const item =
                document.createElement(
                    'button'
                );


            item.type =
                'button';


            item.className =
                'hero-item';


            item.title =
                project.name;


            /*
             * Cover
             */

            if (
                project.cover
            ) {

                const image =
                    document.createElement(
                        'img'
                    );


                image.src =
                    project.cover;


                image.alt =
                    project.name;


                image.loading =
                    'lazy';


                image.decoding =
                    'async';


                item.appendChild(
                    image
                );

            }

            else {

                const placeholder =
                    document.createElement(
                        'div'
                    );


                placeholder.style.cssText = `
                    width:100%;
                    height:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    color:var(--blue-ll);
                    font-size:3rem;
                    background:var(--bg2);
                `;


                placeholder.innerHTML =
                    '<i class="fas fa-folder-open"></i>';


                item.appendChild(
                    placeholder
                );

            }


            /*
             * Name
             */

            const label =
                document.createElement(
                    'div'
                );


            label.className =
                'hero-label';


            label.textContent =
                project.name;


            item.appendChild(
                label
            );


            /*
             * Open
             */

            item.addEventListener(
                'click',
                () => {

                    openProject(
                        project.id
                    );

                }
            );


            fragment.appendChild(
                item
            );

        }
    );


    heroGrid.appendChild(
        fragment
    );
}


// ============================================================
// PROJECT MODAL
// ============================================================

function openProject(
    projectId
) {

    const project =
        projectsData.find(
            item =>
                item.id ===
                projectId
        );


    if (!project) {
        return;
    }


    currentProjectId =
        project.id;


    currentProjectData =
        project;


    if (
        projectModalTitle
    ) {

        projectModalTitle.textContent =
            project.name;

    }


    buildProjectBody(
        project
    );


    showOverlay(
        projectModal
    );
}


function buildProjectBody(
    project
) {

    if (
        !projectModalBody
    ) {
        return;
    }


    projectModalBody.innerHTML =
        '';


    const body =
        document.createElement(
            'div'
        );


    body.className =
        'proj-body-inner';


    /*
     * Cover
     */

    if (
        project.cover
    ) {

        const cover =
            document.createElement(
                'div'
            );


        cover.className =
            'proj-cover';


        const image =
            document.createElement(
                'img'
            );


        image.src =
            project.cover;


        image.alt =
            project.name;


        image.loading =
            'eager';


        image.decoding =
            'async';


        cover.appendChild(
            image
        );


        body.appendChild(
            cover
        );

    }


    /*
     * Media
     */

    const media =
        Array.isArray(
            project.media
        )
            ? project.media
            : [];


    const imageFiles =
        media.filter(
            item =>
                item.type ===
                'image'
        );


    /*
     * Prepare viewer data
     */

    viewerImages =
        imageFiles.map(
            item => ({

                url:
                    item.url,

                desc:
                    item.description,

                name:
                    item.name

            })
        );


    if (
        !media.length
    ) {

        const empty =
            document.createElement(
                'div'
            );


        empty.className =
            'empty-hint';


        empty.innerHTML = `

            <i
                class="fas fa-images"
            ></i>

            <p>
                لا توجد وسائط داخل هذا المشروع
            </p>

        `;


        body.appendChild(
            empty
        );

    }

    else {

        const grid =
            document.createElement(
                'div'
            );


        grid.className =
            'media-grid';


        media.forEach(
            mediaItem => {

                const card =
                    document.createElement(
                        'div'
                    );


                card.className =
                    'media-card';


                /*
                 * IMAGE
                 */

                if (
                    mediaItem.type ===
                    'image'
                ) {

                    const image =
                        document.createElement(
                            'img'
                        );


                    image.className =
                        'mc-img';


                    image.src =
                        mediaItem.url;


                    image.alt =
                        mediaItem.description ||
                        mediaItem.name;


                    image.title =
                        mediaItem.description ||
                        mediaItem.name;


                    image.loading =
                        'lazy';


                    image.decoding =
                        'async';


                    image.addEventListener(
                        'click',
                        event => {

                            event.preventDefault();


                            const index =
                                viewerImages.findIndex(
                                    viewerItem =>
                                        viewerItem.url ===
                                        mediaItem.url
                                );


                            if (
                                index >= 0
                            ) {

                                openViewer(
                                    index
                                );

                            }

                        }
                    );


                    card.appendChild(
                        image
                    );

                }


                /*
                 * VIDEO
                 */

                else if (
                    mediaItem.type ===
                    'video'
                ) {

                    const video =
                        document.createElement(
                            'video'
                        );


                    video.className =
                        'mc-video';


                    video.src =
                        mediaItem.url;


                    video.controls =
                        true;


                    video.preload =
                        'metadata';


                    video.playsInline =
                        true;


                    card.appendChild(
                        video
                    );

                }


                /*
                 * PDF / OTHER
                 */

                else {

                    const link =
                        document.createElement(
                            'a'
                        );


                    link.className =
                        'mc-icon';


                    link.href =
                        mediaItem.url;


                    link.target =
                        '_blank';


                    link.rel =
                        'noopener';


                    link.innerHTML =
                        mediaItem.type ===
                        'pdf'

                            ?

                        `
                            <i
                                class="fas fa-file-pdf"
                                style="
                                    color:#ef5350;
                                    font-size:2.5rem;
                                "
                            ></i>
                        `

                            :

                        `
                            <i
                                class="fas fa-file"
                            ></i>
                        `;


                    card.appendChild(
                        link
                    );

                }


                /*
                 * Description
                 */

                if (
                    mediaItem.description
                ) {

                    const info =
                        document.createElement(
                            'div'
                        );


                    info.className =
                        'mc-info';


                    const description =
                        document.createElement(
                            'span'
                        );


                    description.className =
                        'mc-desc';


                    description.textContent =
                        mediaItem.description;


                    info.appendChild(
                        description
                    );


                    card.appendChild(
                        info
                    );

                }


                grid.appendChild(
                    card
                );

            }
        );


        body.appendChild(
            grid
        );

    }


    projectModalBody.appendChild(
        body
    );
}


// ============================================================
// PROJECT MODAL CONTROLS
// ============================================================

function setupProjectToolbar() {

    const closeButton =
        document.getElementById(
            'closeProjectModal'
        );


    if (
        closeButton
    ) {

        closeButton.addEventListener(
            'click',
            () => {

                hideOverlay(
                    projectModal
                );

            }
        );

    }


    if (
        projectModal
    ) {

        projectModal.addEventListener(
            'click',
            event => {

                if (
                    event.target ===
                    projectModal
                ) {

                    hideOverlay(
                        projectModal
                    );

                }

            }
        );

    }
}


// ============================================================
// VIEWER - CREATE ONCE
// ============================================================


/* ============================================================
   ROOT EXISTING LOGO NARRATOR V13B
   Uses the EXISTING floating lab logo.
   ============================================================ */

let rootNarratorToken = 0;
let rootNarratorTypingTimer = null;
let rootNarratorResizeBound = false;


function rootNarratorLanguage(
    text
) {

    const value =
        String(text || '');

    const hasArabic =
        /[\u0600-\u06FF]/.test(
            value
        );


    return hasArabic
        ? 'ar-SA'
        : 'en-US';

}


function rootNarratorCustomText(
    item
) {

    if (
        !item
    ) {
        return '';
    }


    const text =
        String(
            item.desc || ''
        )
        .trim();


    if (
        !text
    ) {
        return '';
    }


    /*
     * Do not speak the automatic filename text.
     * Speak only a caption that was actually customised.
     */
    const fallback =
        typeof mediaDescription ===
            'function'
            ? String(
                mediaDescription(
                    item.name || ''
                ) || ''
            ).trim()
            : '';


    if (
        fallback &&
        text === fallback
    ) {

        return '';

    }


    return text;

}


function rootEnsureNarratorBubble() {

    let wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    if (
        wrap
    ) {

        rootPositionNarratorBubble();

        return wrap;

    }


    wrap =
        document.createElement(
            'div'
        );


    wrap.id =
        'rootLogoNarrator';


    wrap.className =
        'root-logo-narrator';


    wrap.innerHTML = `

        <div
            class="root-narrator-bubble"
            id="rootNarratorBubble"
        >

            <div
                class="root-narrator-brand"
            >
                ROOT dent
            </div>

            <div
                class="root-narrator-text"
                id="rootNarratorText"
                dir="auto"
            ></div>

        </div>

    `;


    document.body.appendChild(
        wrap
    );


    if (
        !rootNarratorResizeBound
    ) {

        rootNarratorResizeBound =
            true;


        window.addEventListener(
            'resize',
            rootPositionNarratorBubble
        );


        window.addEventListener(
            'scroll',
            rootPositionNarratorBubble,
            {
                passive: true
            }
        );

    }


    rootPositionNarratorBubble();


    return wrap;

}


function rootPositionNarratorBubble() {

    const wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    const logo =
        document.getElementById(
            'labLogo'
        );


    if (
        !wrap ||
        !logo
    ) {
        return;
    }


    const rect =
        logo.getBoundingClientRect();


    if (
        window.innerWidth <=
        700
    ) {

        wrap.style.left =
            '12px';

        wrap.style.right =
            '12px';

        wrap.style.top =
            `${Math.min(
                window.innerHeight - 160,
                rect.bottom + 10
            )}px`;

        wrap.style.transform =
            'none';

        return;

    }


    const logoCenter =
        rect.left +
        (
            rect.width /
            2
        );


    /*
     * Logo on left side:
     * speech bubble appears to its right.
     */
    if (
        logoCenter <
        window.innerWidth *
            .38
    ) {

        wrap.style.left =
            `${rect.right + 16}px`;

        wrap.style.right =
            'auto';

        wrap.style.top =
            `${rect.top + rect.height / 2}px`;

        wrap.style.transform =
            'translateY(-50%)';

        return;

    }


    /*
     * Logo on right side:
     * speech bubble appears to its left.
     */
    if (
        logoCenter >
        window.innerWidth *
            .62
    ) {

        wrap.style.left =
            'auto';

        wrap.style.right =
            `${
                window.innerWidth -
                rect.left +
                16
            }px`;

        wrap.style.top =
            `${rect.top + rect.height / 2}px`;

        wrap.style.transform =
            'translateY(-50%)';

        return;

    }


    /*
     * Centered logo:
     * bubble appears underneath it.
     */
    wrap.style.left =
        '50%';

    wrap.style.right =
        'auto';

    wrap.style.top =
        `${rect.bottom + 15}px`;

    wrap.style.transform =
        'translateX(-50%)';

}


function rootNarratorStop(
    hide = false
) {

    rootNarratorToken++;


    if (
        rootNarratorTypingTimer
    ) {

        clearTimeout(
            rootNarratorTypingTimer
        );

        rootNarratorTypingTimer =
            null;

    }


    if (
        'speechSynthesis' in
        window
    ) {

        window.speechSynthesis
            .cancel();

    }


    const logo =
        document.getElementById(
            'labLogo'
        );


    logo?.classList.remove(
        'root-narrator-speaking'
    );


    if (
        hide
    ) {

        const wrap =
            document.getElementById(
                'rootLogoNarrator'
            );


        if (
            wrap
        ) {

            wrap.classList.remove(
                'show'
            );

        }

    }

}


function rootNarratorVoice(
    language
) {

    if (
        !(
            'speechSynthesis' in
            window
        )
    ) {

        return null;

    }


    const voices =
        window.speechSynthesis
            .getVoices();


    const requested =
        String(
            language || ''
        ).toLowerCase();


    const exact =
        voices.find(
            voice =>
                String(
                    voice.lang || ''
                )
                .toLowerCase() ===
                requested
        );


    if (
        exact
    ) {
        return exact;
    }


    const prefix =
        requested.split(
            '-'
        )[0];


    return (
        voices.find(
            voice =>
                String(
                    voice.lang || ''
                )
                .toLowerCase()
                .startsWith(
                    prefix
                )
        )
        ||
        null
    );

}


function rootSpeakNarrator(
    text,
    token
) {

    if (
        !text ||
        !(
            'speechSynthesis' in
            window
        )
    ) {

        return;

    }


    const language =
        rootNarratorLanguage(
            text
        );


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        language;


    speech.rate =
        .96;


    speech.pitch =
        1;


    const voice =
        rootNarratorVoice(
            language
        );


    if (
        voice
    ) {

        speech.voice =
            voice;

    }


    speech.onstart =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {
                return;
            }


            document
                .getElementById(
                    'labLogo'
                )
                ?.classList
                .add(
                    'root-narrator-speaking'
                );

        };


    const finished =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {
                return;
            }


            document
                .getElementById(
                    'labLogo'
                )
                ?.classList
                .remove(
                    'root-narrator-speaking'
                );

        };


    speech.onend =
        finished;


    speech.onerror =
        finished;


    window.speechSynthesis
        .cancel();


    window.speechSynthesis
        .speak(
            speech
        );

}


function rootTypeNarrator(
    text,
    token
) {

    const element =
        document.getElementById(
            'rootNarratorText'
        );


    if (
        !element
    ) {
        return;
    }


    element.textContent =
        '';


    element.setAttribute(
        'lang',
        rootNarratorLanguage(
            text
        )
    );


    const characters =
        [
            ...String(
                text || ''
            )
        ];


    /*
     * Longer text types slightly faster.
     */
    const delay =
        characters.length >
            160
            ? 11
            :
        characters.length >
            80
            ? 16
            :
            23;


    let index =
        0;


    const typeNext =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {

                return;

            }


            if (
                index >=
                characters.length
            ) {

                rootNarratorTypingTimer =
                    null;

                return;

            }


            element.textContent +=
                characters[
                    index
                ];


            index++;


            rootNarratorTypingTimer =
                setTimeout(
                    typeNext,
                    delay
                );

        };


    typeNext();

}


function rootAnimateOldNarratorMessage(
    oldText
) {

    if (
        !oldText
    ) {
        return;
    }


    const wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    const bubble =
        document.getElementById(
            'rootNarratorBubble'
        );


    if (
        !wrap ||
        !bubble
    ) {
        return;
    }


    const oldBubble =
        bubble.cloneNode(
            true
        );


    oldBubble.removeAttribute(
        'id'
    );


    const oldTextElement =
        oldBubble.querySelector(
            '#rootNarratorText'
        );


    if (
        oldTextElement
    ) {

        oldTextElement.removeAttribute(
            'id'
        );


        oldTextElement.textContent =
            oldText;

    }


    oldBubble
        .querySelectorAll(
            '[id]'
        )
        .forEach(
            element =>
                element.removeAttribute(
                    'id'
                )
        );


    oldBubble.classList.add(
        'root-narrator-old'
    );


    wrap.appendChild(
        oldBubble
    );


    requestAnimationFrame(
        () => {

            oldBubble.classList.add(
                'leave'
            );

        }
    );


    setTimeout(
        () => {

            oldBubble.remove();

        },
        480
    );

}


function rootNarratorAnnounce(
    viewerItem
) {

    const text =
        rootNarratorCustomText(
            viewerItem
        );


    rootEnsureNarratorBubble();


    const wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    const textElement =
        document.getElementById(
            'rootNarratorText'
        );


    const oldText =
        textElement
            ?.textContent
            ?.trim() ||
        '';


    rootNarratorStop(
        false
    );


    if (
        !text
    ) {

        if (
            textElement
        ) {

            textElement.textContent =
                '';

        }


        if (
            wrap
        ) {

            wrap.classList.remove(
                'show'
            );

        }


        return;

    }


    if (
        oldText &&
        oldText !== text
    ) {

        rootAnimateOldNarratorMessage(
            oldText
        );

    }


    if (
        wrap
    ) {

        wrap.classList.add(
            'show'
        );

    }


    rootPositionNarratorBubble();


    const token =
        ++rootNarratorToken;


    rootTypeNarrator(
        text,
        token
    );


    rootSpeakNarrator(
        text,
        token
    );

}

/* ROOT EXISTING LOGO NARRATOR V13B END */

function ensureViewer() {

    let overlay =
        document.getElementById(
            'viewerOverlay'
        );


    if (
        overlay &&
        viewerInitialized
    ) {

        return overlay;
    }


    /*
     * Create
     */

    overlay =
        document.createElement(
            'div'
        );


    overlay.id =
        'viewerOverlay';


    overlay.className =
        'viewer-overlay';


    overlay.innerHTML = `

        <div
            class="viewer-box viewer-box--img"
            role="dialog"
            aria-modal="true"
        >

            <button
                class="viewer-close"
                id="viewerClose"
                type="button"
                aria-label="إغلاق"
                title="إغلاق"
            >

                <i
                    class="fas fa-times"
                ></i>

            </button>


            <div
                class="viewer-top-bar"
            >

                <span
                    class="viewer-counter"
                    id="viewerCounter"
                >
                    1 / 1
                </span>

            </div>


            <div
                class="viewer-img-area"
                id="viewerImgArea"
            >

                <img
                    class="viewer-img"
                    id="viewerImg"
                    src=""
                    alt=""
                    draggable="false"
                >

            </div>



            <!-- ROOT DESKTOP VIEWER NAV V11 -->

            <button
                class="viewer-nav viewer-prev"
                id="viewerPrev"
                type="button"
                aria-label="الصورة السابقة"
                title="السابق"
            >
                <i class="fas fa-chevron-right"></i>
            </button>


            <button
                class="viewer-nav viewer-next"
                id="viewerNext"
                type="button"
                aria-label="الصورة التالية"
                title="التالي"
            >
                <i class="fas fa-chevron-left"></i>
            </button>

            <div
                class="viewer-description"
                id="viewerDescription"
            ></div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    viewerInitialized =
        true;


    bindViewerEvents(
        overlay
    );


    return overlay;
}


// ============================================================
// VIEWER EVENTS
// ============================================================

function bindViewerEvents(
    overlay
) {

    const closeButton =
        document.getElementById(
            'viewerClose'
        );


    const imageArea =
        document.getElementById(
            'viewerImgArea'
        );


    const image =
        document.getElementById(
            'viewerImg'
        );


    if (
        closeButton
    ) {

        closeButton.onclick =
            event => {

                event.preventDefault();
                event.stopPropagation();

                closeViewer();

            };

    }



    /* ROOT VIEWER DESKTOP NAV EVENTS V11 */

    const previousButton =
        document.getElementById(
            'viewerPrev'
        );


    const nextButton =
        document.getElementById(
            'viewerNext'
        );


    if (
        previousButton
    ) {

        previousButton.onclick =
            event => {

                event.preventDefault();
                event.stopPropagation();

                navigateViewer(
                    -1
                );

            };

    }


    if (
        nextButton
    ) {

        nextButton.onclick =
            event => {

                event.preventDefault();
                event.stopPropagation();

                navigateViewer(
                    1
                );

            };

    }

    let swipeStart = null;


    imageArea.addEventListener(
        'touchstart',
        event => {

            if (
                event.touches.length !==
                1
            ) {

                swipeStart = null;
                return;

            }


            swipeStart = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };

        },
        {
            passive: true
        }
    );


    imageArea.addEventListener(
        'touchend',
        event => {

            if (
                !swipeStart ||
                event.changedTouches.length !==
                1
            ) {

                swipeStart = null;
                return;

            }


            const touch =
                event.changedTouches[0];

            const deltaX =
                touch.clientX -
                swipeStart.x;

            const deltaY =
                touch.clientY -
                swipeStart.y;


            if (
                Math.abs(deltaX) >
                50 &&
                Math.abs(deltaX) >
                Math.abs(deltaY)
            ) {

                navigateViewer(
                    deltaX < 0
                        ? 1
                        : -1
                );

            }


            swipeStart = null;

        },
        {
            passive: true
        }
    );


    imageArea.addEventListener(
        'touchmove',
        event => {

            if (
                event.touches.length ===
                1 &&
                Math.abs(
                    event.touches[0].clientX -
                    (swipeStart ? swipeStart.x : event.touches[0].clientX)
                ) > 18
            ) {

                event.preventDefault();

            }

        },
        {
            passive: false
        }
    );


    image.addEventListener(
        'mousedown',
        event => {

            if (
                event.button !==
                0
            ) {

                return;

            }


            swipeStart = {
                x: event.clientX,
                y: event.clientY
            };

        }
    );


    image.addEventListener(
        'mouseup',
        event => {

            if (
                !swipeStart
            ) {

                return;

            }


            const deltaX =
                event.clientX -
                swipeStart.x;

            const deltaY =
                event.clientY -
                swipeStart.y;


            if (
                Math.abs(deltaX) >
                50 &&
                Math.abs(deltaX) >
                Math.abs(deltaY)
            ) {

                navigateViewer(
                    deltaX < 0
                        ? 1
                        : -1
                );

            }


            swipeStart = null;

        }
    );


    document.addEventListener(
        'keydown',
        event => {

            const currentViewer =
                document.getElementById(
                    'viewerOverlay'
                );


            if (
                !currentViewer ||
                currentViewer.style.display ===
                    'none'
            ) {

                return;
            }


            if (
                event.key ===
                'Escape'
            ) {

                closeViewer();

            }

            else if (
                event.key ===
                'ArrowRight'
            ) {

                navigateViewer(
                    -1
                );

            }

            else if (
                event.key ===
                'ArrowLeft'
            ) {

                navigateViewer(
                    1
                );

            }

        }
    );


    const viewerBox =
        overlay.querySelector(
            '.viewer-box'
        );


    viewerBox.addEventListener(
        'click',
        event => {

            event.stopPropagation();

        }
    );

}



// ============================================================
// SHOW VIEWER
// ============================================================

function openViewer(
    index
) {

    if (
        !viewerImages.length
    ) {

        return;

    }


    const overlay =
        ensureViewer();


    viewerIndex =
        Math.max(
            0,
            Math.min(
                Number(index) || 0,
                viewerImages.length - 1
            )
        );


    viewerZoom =
        1;


    viewerOffset = {
        x: 0,
        y: 0
    };


    updateViewer();


    overlay.style.display =
        'flex';


    overlay.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.style.overflow =
        'hidden';

}


// ============================================================
// UPDATE VIEWER WITHOUT REBUILDING IT
// ============================================================

function updateViewer() {

    const item =
        viewerImages[
            viewerIndex
        ];


    if (!item) {
        return;
    }


    const overlay =
        ensureViewer();


    const image =
        document.getElementById(
            'viewerImg'
        );


    const counter =
        document.getElementById(
            'viewerCounter'
        );


    const description =
        document.getElementById(
            'viewerDescription'
        );


    const openButton =
        document.getElementById(
            'viewerOpen'
        );


    const previousButton =
        document.getElementById(
            'viewerPrev'
        );


    const nextButton =
        document.getElementById(
            'viewerNext'
        );


    if (
        image
    ) {

        image.src =
            item.url;

        image.alt =
            item.desc ||
            item.name ||
            '';

        image.title =
            item.desc ||
            item.name ||
            '';

    }


    if (
        counter
    ) {

        counter.textContent =
            `${viewerIndex + 1} / ${viewerImages.length}`;

    }


    if (
        description
    ) {

        description.textContent =
            item.desc ||
            item.name ||
            '';

    }


    if (
        openButton
    ) {

        openButton.href =
            item.url;

    }


    
    /* ROOT NARRATOR UPDATE CALL V13B */
    rootNarratorAnnounce(
        item
    );

const hasMultiple =
        viewerImages.length >
        1;


    if (
        previousButton
    ) {

        previousButton.style.display =
            hasMultiple
                ? 'flex'
                : 'none';

    }


    if (
        nextButton
    ) {

        nextButton.style.display =
            hasMultiple
                ? 'flex'
                : 'none';

    }


    viewerZoom =
        1;


    viewerOffset = {
        x: 0,
        y: 0
    };


    applyViewerTransform();


    if (
        overlay.style.display !==
        'flex'
    ) {

        overlay.style.display =
            'flex';

    }

}


// ============================================================
// PREVIOUS / NEXT
// ============================================================


/* ============================================================
   ROOT VIEWER STEP ANIMATION V11
   ============================================================ */

function animateViewerStep() {

    const image =
        document.getElementById(
            'viewerImg'
        );


    if (
        !image ||
        typeof image.animate !==
            'function'
    ) {
        return;
    }


    image.animate(
        [
            {
                opacity:
                    .35
            },
            {
                opacity:
                    1
            }
        ],
        {
            duration:
                190,

            easing:
                'ease-out'
        }
    );

}

/* ROOT VIEWER STEP ANIMATION V11 END */

function navigateViewer(
    direction
) {

    if (
        viewerImages.length <=
        1
    ) {

        return;

    }


    viewerIndex =
        (
            viewerIndex +
            direction +
            viewerImages.length
        ) %
        viewerImages.length;


    updateViewer();

    animateViewerStep();

}


// ============================================================
// CLOSE VIEWER
// ============================================================

function closeViewer() {

    /* ROOT NARRATOR CLOSE V13B */
    rootNarratorStop(true);


    const overlay =
        document.getElementById(
            'viewerOverlay'
        );


    if (
        !overlay
    ) {

        return;

    }


    overlay.style.display =
        'none';


    overlay.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.style.overflow =
        '';

}


// ============================================================
// VIEWER ZOOM
// ============================================================

function changeViewerZoom(
    delta
) {

    viewerZoom =
        Math.min(
            5,
            Math.max(
                0.5,
                viewerZoom + delta
            )
        );


    applyViewerTransform();

}


function applyViewerTransform() {

    const image =
        document.getElementById(
            'viewerImg'
        );


    if (
        !image
    ) {

        return;

    }


    if (
        viewerZoom <=
        1
    ) {

        viewerOffset = {
            x: 0,
            y: 0
        };

    }


    image.style.transform =
        `
        translate(
            ${viewerOffset.x}px,
            ${viewerOffset.y}px
        )
        scale(
            ${viewerZoom}
        )
        `;


    image.style.cursor =
        viewerZoom > 1
            ? 'grab'
            : 'default';

}


// ============================================================
// VIEWER DRAG
// ============================================================

function viewerMouseMove(
    event
) {

    if (
        !viewerDragging
    ) {

        return;

    }


    const overlay =
        document.getElementById(
            'viewerOverlay'
        );


    if (
        !overlay ||
        overlay.style.display !==
            'flex'
    ) {

        return;

    }


    viewerOffset.x =
        event.clientX -
        viewerDragStart.x;


    viewerOffset.y =
        event.clientY -
        viewerDragStart.y;


    applyViewerTransform();

}


function viewerMouseUp() {

    viewerDragging =
        false;


    const image =
        document.getElementById(
            'viewerImg'
        );


    if (
        image
    ) {

        image.style.cursor =
            viewerZoom > 1
                ? 'grab'
                : 'default';

    }

}


// ============================================================
// PRICING
// ============================================================

async function fetchPricingFromStorage() {

    const files =
        await listAllFilesRecursively(
            PRICING_ROOT
        );


    return files.filter(
        file =>
            file.type ===
            'image'
    );
}


async function ensurePricingLoaded() {

    if (
        pricingLoaded
    ) {

        return;

    }


    pricingData =
        await fetchPricingFromStorage();


    pricingLoaded =
        true;
}


function centerPricingScroll() {

    if (
        !pricingScrollContainer ||
        !pricingScrollTrack
    ) {

        return;

    }


    const wrapper =
        pricingScrollContainer.querySelector(
            '.pricing-scroll-wrapper'
        );


    if (
        !wrapper
    ) {

        return;

    }


    const maxScroll =
        wrapper.scrollWidth -
        wrapper.clientWidth;


    if (
        maxScroll > 0
    ) {

        wrapper.scrollLeft =
            maxScroll / 2;

    }
}


let pricingZoomState = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    pinchStartDistance: 0,
    pinchStartScale: 1,
    dragStart: null,
    dragStartOffset: {
        x: 0,
        y: 0
    }
};


function resetPricingZoom() {

    pricingZoomState.scale = 1;
    pricingZoomState.offsetX = 0;
    pricingZoomState.offsetY = 0;
    pricingZoomState.pinchStartDistance = 0;
    pricingZoomState.pinchStartScale = 1;
    pricingZoomState.dragStart = null;
    pricingZoomState.dragStartOffset = {
        x: 0,
        y: 0
    };

    if (pricingScrollWrapper) {

        pricingScrollWrapper.classList.remove('pricing-zoomed');
        pricingScrollWrapper.style.transform = 'translate(0px, 0px) scale(1)';
        pricingScrollWrapper.style.transformOrigin = 'center top';

    }

}


function applyPricingZoom() {

    if (!pricingScrollWrapper) {

        return;
    }


    pricingZoomState.scale =
        Math.min(
            3,
            Math.max(
                1,
                pricingZoomState.scale
            )
        );


    pricingScrollWrapper.classList.toggle(
        'pricing-zoomed',
        pricingZoomState.scale > 1
    );


    pricingScrollWrapper.style.transform =
        `translate(${pricingZoomState.offsetX}px, ${pricingZoomState.offsetY}px) scale(${pricingZoomState.scale})`;

    pricingScrollWrapper.style.transformOrigin =
        'center top';

}


function setupPricingZoom() {

    if (
        !pricingScrollWrapper ||
        pricingScrollWrapper.dataset.pricingZoomBound === 'true'
    ) {

        return;
    }


    pricingScrollWrapper.dataset.pricingZoomBound = 'true';


    pricingScrollWrapper.addEventListener(
        'touchstart',
        event => {

            if (
                event.touches.length ===
                2
            ) {

                const a =
                    event.touches[0];

                const b =
                    event.touches[1];

                const dx =
                    b.clientX - a.clientX;

                const dy =
                    b.clientY - a.clientY;

                pricingZoomState.pinchStartDistance =
                    Math.hypot(dx, dy);

                pricingZoomState.pinchStartScale =
                    pricingZoomState.scale;

                pricingZoomState.dragStart = null;

                return;

            }


            if (
                event.touches.length ===
                1
            ) {

                if (
                    pricingZoomState.scale <= 1
                ) {

                    pricingZoomState.dragStart = null;
                    pricingZoomState.dragStartOffset = {
                        x: pricingZoomState.offsetX,
                        y: pricingZoomState.offsetY
                    };

                    return;

                }

                pricingZoomState.dragStart = {
                    x: event.touches[0].clientX,
                    y: event.touches[0].clientY
                };

                pricingZoomState.dragStartOffset = {
                    x: pricingZoomState.offsetX,
                    y: pricingZoomState.offsetY
                };

            }

        },
        {
            passive: true
        }
    );


    pricingScrollWrapper.addEventListener(
        'touchmove',
        event => {

            if (
                event.touches.length ===
                2 &&
                pricingZoomState.pinchStartDistance > 0
            ) {

                event.preventDefault();

                const a =
                    event.touches[0];

                const b =
                    event.touches[1];

                const dx =
                    b.clientX - a.clientX;

                const dy =
                    b.clientY - a.clientY;

                const distance =
                    Math.hypot(dx, dy);

                pricingZoomState.scale =
                    (distance / pricingZoomState.pinchStartDistance) * pricingZoomState.pinchStartScale;

                applyPricingZoom();

                return;

            }


            if (
                event.touches.length ===
                1 &&
                pricingZoomState.scale > 1 &&
                pricingZoomState.dragStart
            ) {

                const touch =
                    event.touches[0];

                const deltaX =
                    touch.clientX -
                    pricingZoomState.dragStart.x;

                const deltaY =
                    touch.clientY -
                    pricingZoomState.dragStart.y;

                event.preventDefault();

                pricingZoomState.offsetX =
                    pricingZoomState.dragStartOffset.x +
                    deltaX;

                pricingZoomState.offsetY =
                    pricingZoomState.dragStartOffset.y +
                    deltaY;

                applyPricingZoom();

            }

        },
        {
            passive: false
        }
    );


    pricingScrollWrapper.addEventListener(
        'touchend',
        () => {

            pricingZoomState.pinchStartDistance = 0;
            pricingZoomState.pinchStartScale = 1;
            pricingZoomState.dragStart = null;
            pricingZoomState.dragStartOffset = {
                x: pricingZoomState.offsetX,
                y: pricingZoomState.offsetY
            };

            if (
                pricingZoomState.scale < 1.05
            ) {

                resetPricingZoom();

            }

        },
        {
            passive: true
        }
    );


    pricingScrollWrapper.addEventListener(
        'wheel',
        event => {

            if (
                !event.ctrlKey
            ) {

                return;

            }


            event.preventDefault();

            pricingZoomState.scale =
                Math.min(
                    3,
                    Math.max(
                        1,
                        pricingZoomState.scale +
                        (event.deltaY > 0 ? -0.12 : 0.12)
                    )
                );

            applyPricingZoom();

        },
        {
            passive: false
        }
    );


    pricingScrollWrapper.addEventListener(
        'dblclick',
        () => {

            if (
                pricingZoomState.scale > 1
            ) {

                resetPricingZoom();

            }

            else {

                pricingZoomState.scale = 2;
                applyPricingZoom();

            }

        }
    );


    resetPricingZoom();

}


function renderPricing() {

    if (
        !pricingScrollTrack
    ) {

        return;
    }


    pricingScrollTrack.innerHTML =
        '';


    if (
        !pricingData.length
    ) {

        pricingScrollTrack.innerHTML = `

            <div
                class="empty-hint"
            >

                <i
                    class="fas fa-images"
                ></i>

                <p>
                    لا توجد قائمة أسعار
                </p>

            </div>

        `;

        return;
    }


    const fragment =
        document.createDocumentFragment();


    pricingData.forEach(
        item => {

            const wrapper =
                document.createElement(
                    'div'
                );


            wrapper.className =
                'pricing-page-image';


            const image =
                document.createElement(
                    'img'
                );


            image.src =
                item.url;

            image.alt =
                mediaDescription(
                    item.name
                );

            image.loading =
                'lazy';

            image.decoding =
                'async';


            wrapper.appendChild(
                image
            );


            fragment.appendChild(
                wrapper
            );

        }
    );


    pricingScrollTrack.appendChild(
        fragment
    );


    setupPricingZoom();


    requestAnimationFrame(
        centerPricingScroll
    );
}

function showPricing() {

    const button =
        document.getElementById(
            'navPricingBtn'
        );


    activateNav(
        button
    );


    if (
        heroGrid
    ) {

        heroGrid.style.display =
            'none';

    }


    if (
        pricingScrollContainer
    ) {

        pricingScrollContainer.style.display =
            'flex';

    }


    document.body.classList.remove(
        'about-view-active'
    );


    if (
        pricingLoaded
    ) {

        renderPricing();

    }


    setLogoPosition(
        'right'
    );
}


async function showPricingAndLoad() {

    /* ROOT HIDE ABOUT BEFORE PRICING V10 */
    hideAboutImageImmediately();

    const button =
        document.getElementById(
            'navPricingBtn'
        );


    activateNav(
        button
    );


    /*
     * ROOT PRICING MOTION SYNC V1
     *
     * Start logo movement IMMEDIATELY.
     * Do not wait for Supabase or pricing rendering.
     */
    setLogoPosition(
        'right'
    );


    if (
        heroGrid
    ) {

        heroGrid.style.display =
            'none';

    }


    if (
        pricingScrollContainer
    ) {

        pricingScrollContainer.style.display =
            'flex';

    }


    document.body.classList.remove(
        'about-view-active'
    );


    /*
     * Give the browser two frames to actually start
     * the logo transition before pricing work begins.
     *
     * This makes About -> Pricing feel as smooth
     * as Products -> About.
     */
    await new Promise(
        resolve => {

            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        resolve
                    );

                }
            );

        }
    );


    try {

        await ensurePricingLoaded();

        renderPricing();

    }

    catch (error) {

        console.error(
            'Pricing load failed:',
            error
        );


        if (
            pricingScrollTrack
        ) {

            pricingScrollTrack.innerHTML = `

                <div
                    class="empty-hint"
                >

                    <i
                        class="fas fa-triangle-exclamation"
                    ></i>

                    <p>
                        تعذر تحميل قائمة الأسعار
                    </p>

                </div>

            `;

        }

    }

}

// ============================================================
// ABOUT
// ============================================================

function showAbout() {

    const button =
        document.getElementById(
            'navAboutBtn'
        );


    activateNav(
        button
    );


    document.body.classList.add(
        'about-view-active'
    );


    if (
        heroGrid
    ) {

        heroGrid.style.display =
            'flex';


        heroGrid.style.flexDirection =
            'column';


        heroGrid.style.justifyContent =
            'center';


        heroGrid.style.alignItems =
            'center';


        heroGrid.style.minHeight =
            '70vh';


        heroGrid.style.width =
            '100%';


        heroGrid.style.padding =
            '20px';


        heroGrid.innerHTML = `

            <div
                class="about-image-container"
            >

                <img
                    src="${storageUrl(ABOUT_IMAGE_PATH)}"
                    alt="شعار ROOT dent"
                    id="aboutLogoImage"
                >

            </div>

        `;


        /*
         * تبدأ الأنيميشن بعد ثانيتين.
         */

        setTimeout(
            () => {

                const image =
                    document.getElementById(
                        'aboutLogoImage'
                    );


                if (
                    image
                ) {

                    image.classList.add(
                        'show'
                    );

                }

            },
            2000
        );

    }


    if (
        pricingScrollContainer
    ) {

        pricingScrollContainer.style.display =
            'none';

    }


    /* ROOT ABOUT PRE-FLIGHT CENTER V6 */

    syncLogoToAboutImage();

    setLogoPosition(
        'center'
    );


    requestAnimationFrame(
        () => {

            syncLogoToAboutImage();

            requestAnimationFrame(
                syncLogoToAboutImage
            );

        }
    );
}



/* ============================================================
   ROOT ABOUT INSTANT EXIT V10
   The large About image disappears immediately.
   Floating corner logo animation remains untouched.
   ============================================================ */

function hideAboutImageImmediately() {

    const aboutImage =
        document.getElementById(
            'aboutLogoImage'
        );


    const aboutContainer =
        document.querySelector(
            '.about-image-container'
        );


    if (
        aboutImage
    ) {

        aboutImage.style.transition =
            'none';

        aboutImage.style.animation =
            'none';

        aboutImage.style.opacity =
            '0';

        aboutImage.style.visibility =
            'hidden';

        aboutImage.style.display =
            'none';

    }


    if (
        aboutContainer
    ) {

        aboutContainer.style.transition =
            'none';

        aboutContainer.style.animation =
            'none';

        aboutContainer.style.opacity =
            '0';

        aboutContainer.style.visibility =
            'hidden';

        aboutContainer.style.display =
            'none';

        /*
         * Remove only the large About artwork.
         * showAbout() creates it again next time.
         */
        aboutContainer.remove();

    }


    document.body.classList.remove(
        'about-view-active'
    );

}

/* ROOT ABOUT INSTANT EXIT V10 END */

// ============================================================
// PRODUCTS
// ============================================================

function showProducts() {

    /* ROOT HIDE ABOUT BEFORE PRODUCTS V10 */
    hideAboutImageImmediately();

    const button =
        document.getElementById(
            'navProductsBtn'
        );


    activateNav(
        button
    );


    if (
        pricingScrollContainer
    ) {

        pricingScrollContainer.style.display =
            'none';

    }


    document.body.classList.remove(
        'about-view-active'
    );


    if (
        heroGrid
    ) {

        heroGrid.style.display =
            'grid';


        heroGrid.style.flexDirection =
            '';

        heroGrid.style.justifyContent =
            '';

        heroGrid.style.alignItems =
            '';

        heroGrid.style.minHeight =
            '';

        heroGrid.style.width =
            '';

        heroGrid.style.padding =
            '';

    }


    /*
     * لا نقرأ Supabase مرة أخرى.
     */

    

    /*
     * ROOT PROJECT LIVE REFRESH V9
     * Always reload projects from Supabase.
     */
    projectsLoaded = false;

    ensureProjectsLoaded()
        .then(
            () => {

                renderProjects();

            }
        )
        .catch(
            error => {

                console.error(
                    'Projects refresh failed:',
                    error
                );

                renderProjects();

            }
        );




    setLogoPosition(
        'left'
    );
}


// ============================================================
// NAV ACTIVATION
// ============================================================

function activateNav(
    activeButton
) {

    document
        .querySelectorAll(
            '.nav-btn'
        )
        .forEach(
            button =>
                button.classList.remove(
                    'active'
                )
        );


    if (
        activeButton
    ) {

        activeButton.classList.add(
            'active'
        );

    }
}


// ============================================================
// NAVIGATION SETUP
// ============================================================

function setupNavButtons() {

    const navProducts =
        document.getElementById(
            'navProductsBtn'
        );


    const navAbout =
        document.getElementById(
            'navAboutBtn'
        );


    const navPricing =
        document.getElementById(
            'navPricingBtn'
        );


    if (
        navAbout
    ) {

        navAbout.textContent =
            'شعارنا';

    }


    if (
        navProducts
    ) {

        navProducts.addEventListener(
            'click',
            showProducts
        );

    }


    if (
        navAbout
    ) {

        navAbout.addEventListener(
            'click',
            showAbout
        );

    }


    if (
        navPricing
    ) {

        navPricing.addEventListener(
            'click',
            showPricingAndLoad
        );

    }


    if (
        navProducts
    ) {

        navProducts.classList.add(
            'active'
        );

    }
}


// ============================================================
// LOGO POSITION
// ============================================================

function setLogoPosition(
    position
) {

    if (
        !labLogo
    ) {

        return;

    }


    const previousPosition =
        currentLogoPosition;


    /*
     * Unique motion ID.
     * Prevents old animation callbacks from interfering
     * if the user clicks tabs quickly.
     */
    const motionId =
        (
            Number(
                labLogo.dataset.logoMotionId ||
                0
            )
            +
            1
        );


    labLogo.dataset.logoMotionId =
        String(
            motionId
        );


    /*
     * Remove an old flying clone if one exists.
     */
    const oldFlight =
        document.getElementById(
            'rootLogoFlightClone'
        );


    if (
        oldFlight
    ) {

        oldFlight.remove();

    }


    /*
     * Always restore the real logo first.
     */
    labLogo.style.visibility =
        '';

    labLogo.style.opacity =
        '';

    labLogo.style.filter =
        '';

    labLogo.style.transition =
        '';

    labLogo.classList.remove(
        'logo-teleporting'
    );


    /*
     * Cancel only custom teleport animations.
     */
    labLogo
        .getAnimations()
        .forEach(
            animation => {

                const id =
                    String(
                        animation.id ||
                        ''
                    );


                if (
                    id.startsWith(
                        'root-logo-teleport'
                    )
                ) {

                    animation.cancel();

                }

            }
        );


    if (
        position ===
        previousPosition
    ) {

        return;

    }


    const isEdgeToEdge = (

        (
            previousPosition ===
            'left'
            &&
            position ===
            'right'
        )

        ||

        (
            previousPosition ===
            'right'
            &&
            position ===
            'left'
        )

    );


    /*
     * =======================================================
     * STRAIGHT FLIGHT
     *
     * ABOUT <-> PRICING
     *
     * The visible logo flies using one object from its exact
     * current screen coordinates to the exact target screen
     * coordinates.
     *
     * X and Y use the SAME easing and SAME duration,
     * therefore the geometric path is a true straight line.
     * =======================================================
     */

    const isCenterRightFlight = (

        (
            previousPosition ===
            'center'
            &&
            position ===
            'right'
        )

        ||

        (
            previousPosition ===
            'right'
            &&
            position ===
            'center'
        )

    );


    if (
        isCenterRightFlight
    ) {

        const startRect =
            labLogo.getBoundingClientRect();


        const computed =
            window.getComputedStyle(
                labLogo
            );


        /*
         * Clone the exact visible logo.
         * The real logo will be moved invisibly
         * to its destination.
         */
        const flyingLogo =
            labLogo.cloneNode(
                true
            );


        flyingLogo.id =
            'rootLogoFlightClone';


        flyingLogo.classList.remove(
            'position-left',
            'position-right',
            'position-center',
            'logo-teleporting'
        );


        flyingLogo.style.position =
            'fixed';

        flyingLogo.style.left =
            startRect.left +
            'px';

        flyingLogo.style.top =
            startRect.top +
            'px';

        flyingLogo.style.right =
            'auto';

        flyingLogo.style.bottom =
            'auto';

        flyingLogo.style.width =
            startRect.width +
            'px';

        flyingLogo.style.height =
            startRect.height +
            'px';

        flyingLogo.style.boxSizing =
            'border-box';

        flyingLogo.style.margin =
            '0';

        flyingLogo.style.transform =
            'none';

        flyingLogo.style.transition =
            'none';

        flyingLogo.style.animation =
            'none';

        flyingLogo.style.opacity =
            '1';

        flyingLogo.style.visibility =
            'visible';

        flyingLogo.style.pointerEvents =
            'none';

        flyingLogo.style.zIndex =
            '20000';

        flyingLogo.style.borderColor =
            computed.borderColor;

        flyingLogo.style.boxShadow =
            computed.boxShadow;

        flyingLogo.style.background =
            computed.background;

        flyingLogo.style.willChange =
            'left, top, width, height';


        document.body.appendChild(
            flyingLogo
        );

        /*
         * ROOT CENTER GLOW CONTROL V4
         *
         * Leaving About:
         * kill the big glow almost immediately.
         *
         * Entering About:
         * gently build the glow during the flight.
         */

        if (
            previousPosition ===
            'center'
        ) {

            const leaveGlow =
                flyingLogo.animate(

                    [
                        {
                            boxShadow:
                                computed.boxShadow,

                            borderColor:
                                computed.borderColor
                        },

                        {
                            boxShadow:
                                '0 0 30px rgba(66, 165, 245, .35)',

                            borderColor:
                                'rgb(21, 101, 192)'
                        }
                    ],

                    {
                        duration:
                            100,

                        easing:
                            'ease-out',

                        fill:
                            'forwards'
                    }

                );

            leaveGlow.id =
                'root-logo-leave-center-glow';

        }


        if (
            position ===
            'center'
        ) {

            const enterGlow =
                flyingLogo.animate(

                    [
                        {
                            boxShadow:
                                '0 0 30px rgba(66, 165, 245, .35)'
                        },

                        {
                            boxShadow:
                                '0 0 58px rgba(66, 165, 245, .58)'
                        }
                    ],

                    {
                        duration:
                            700,

                        easing:
                            'cubic-bezier(.4, 0, .2, 1)',

                        fill:
                            'forwards'
                    }

                );

            enterGlow.id =
                'root-logo-enter-center-glow';

        }


        /*
         * ROOT CENTER MOTION POLISH V3
         *
         * When leaving About/center, remove the large
         * center glow quickly instead of carrying it
         * through the entire flight.
         */
        if (
            previousPosition ===
            'center'
        ) {

            const glowFade =
                flyingLogo.animate(

                    [

                        {
                            boxShadow:
                                computed.boxShadow
                        },

                        {
                            boxShadow:
                                '0 0 30px rgba(66, 165, 245, .35)'
                        }

                    ],

                    {
                        duration:
                            130,

                        easing:
                            'ease-out',

                        fill:
                            'forwards'
                    }

                );


            glowFade.id =
                'root-logo-glow-fade';

        }



        /*
         * Move the REAL logo instantly and invisibly
         * to the target, so we can measure its exact
         * destination.
         */
        labLogo.style.visibility =
            'hidden';

        labLogo.style.transition =
            'none';


        labLogo.classList.remove(
            'position-left',
            'position-right',
            'position-center'
        );


        labLogo.classList.add(
            `position-${position}`
        );


        currentLogoPosition =
            position;


        /*
         * Force layout.
         */
        void labLogo.offsetWidth;


        const endRect =
            labLogo.getBoundingClientRect();


        /*
         * The real logo is already at the destination.
         * Restore its transition for future movements,
         * but keep it hidden until the flight finishes.
         */
        labLogo.style.transition =
            '';


        /*
         * One clean straight-line flight.
         *
         * No blur.
         * No teleport.
         * No curved keyframes.
         * No intermediate points.
         */
        const flight =
            flyingLogo.animate(

                [

                    {
                        left:
                            startRect.left +
                            'px',

                        top:
                            startRect.top +
                            'px',

                        width:
                            startRect.width +
                            'px',

                        height:
                            startRect.height +
                            'px',

                        opacity:
                            1
                    },

                    {
                        left:
                            endRect.left +
                            'px',

                        top:
                            endRect.top +
                            'px',

                        width:
                            endRect.width +
                            'px',

                        height:
                            endRect.height +
                            'px',

                        opacity:
                            1
                    }

                ],

                {
                    duration:
                        700,

                    easing:
                        'cubic-bezier(.4, 0, .2, 1)',

                    fill:
                        'forwards'
                }

            );


        flight.id =
            'root-logo-straight-flight';


        flight.finished
            .then(
                () => {

                    if (
                        String(
                            labLogo.dataset.logoMotionId
                        )
                        !==
                        String(
                            motionId
                        )
                    ) {

                        flyingLogo.remove();

                        return;

                    }


                    flyingLogo.remove();


                    labLogo.style.visibility =
                        '';

                    labLogo.style.opacity =
                        '';

                    labLogo.style.filter =
                        '';

                }
            )
            .catch(
                () => {

                    flyingLogo.remove();


                    labLogo.style.visibility =
                        '';

                }
            );


        return;

    }


    /*
     * =======================================================
     * TELEPORT
     *
     * PRODUCTS <-> PRICING
     * =======================================================
     */

    if (
        isEdgeToEdge
    ) {

        currentLogoPosition =
            position;


        const exitDirection =
            previousPosition ===
            'left'
                ? -150
                : 150;


        const enterDirection =
            position ===
            'left'
                ? -150
                : 150;


        labLogo.classList.add(
            'logo-teleporting'
        );


        const exitAnimation =
            labLogo.animate(

                [

                    {
                        transform:
                            'translateX(0px) scale(1)',

                        opacity:
                            1,

                        filter:
                            'blur(0px) brightness(1)'
                    },

                    {
                        transform:
                            `translateX(${exitDirection}px) scale(.76)`,

                        opacity:
                            0,

                        filter:
                            'blur(9px) brightness(1.55)'
                    }

                ],

                {
                    duration:
                        230,

                    easing:
                        'cubic-bezier(.55, 0, 1, .45)',

                    fill:
                        'forwards'
                }

            );


        exitAnimation.id =
            'root-logo-teleport-exit';


        exitAnimation.finished
            .then(
                () => {

                    if (
                        String(
                            labLogo.dataset.logoMotionId
                        )
                        !==
                        String(
                            motionId
                        )
                    ) {

                        return;

                    }


                    labLogo.style.opacity =
                        '0';


                    exitAnimation.cancel();


                    labLogo.classList.remove(
                        'position-left',
                        'position-right',
                        'position-center'
                    );


                    labLogo.classList.add(
                        `position-${position}`
                    );


                    void labLogo.offsetWidth;


                    const enterAnimation =
                        labLogo.animate(

                            [

                                {
                                    transform:
                                        `translateX(${enterDirection}px) scale(.76)`,

                                    opacity:
                                        0,

                                    filter:
                                        'blur(10px) brightness(1.65)'
                                },

                                {
                                    transform:
                                        'translateX(0px) scale(1.04)',

                                    opacity:
                                        1,

                                    offset:
                                        .78,

                                    filter:
                                        'blur(0px) brightness(1.12)'
                                },

                                {
                                    transform:
                                        'translateX(0px) scale(1)',

                                    opacity:
                                        1,

                                    filter:
                                        'blur(0px) brightness(1)'
                                }

                            ],

                            {
                                duration:
                                    320,

                                easing:
                                    'cubic-bezier(.16, 1, .3, 1)',

                                fill:
                                    'forwards'
                            }

                        );


                    enterAnimation.id =
                        'root-logo-teleport-enter';


                    labLogo.style.opacity =
                        '';


                    enterAnimation.finished
                        .then(
                            () => {

                                if (
                                    String(
                                        labLogo.dataset.logoMotionId
                                    )
                                    !==
                                    String(
                                        motionId
                                    )
                                ) {

                                    return;

                                }


                                enterAnimation.cancel();


                                labLogo.style.opacity =
                                    '';

                                labLogo.style.filter =
                                    '';

                                labLogo.classList.remove(
                                    'logo-teleporting'
                                );

                            }
                        )
                        .catch(
                            () => {}
                        );

                }
            )
            .catch(
                () => {}
            );


        return;

    }


    /*
     * =======================================================
     * NORMAL ORIGINAL MOTION
     *
     * PRODUCTS <-> ABOUT
     * =======================================================
     */

    labLogo.classList.remove(
        'position-left',
        'position-right',
        'position-center'
    );


    labLogo.classList.add(
        `position-${position}`
    );


    currentLogoPosition =
        position;

}


/* ROOT ABOUT IMAGE TRACKING V6 START */

let rootAboutSyncFrame = null;


function syncLogoToAboutImage() {

    if (
        !labLogo
    ) {

        return;

    }


    if (
        !document.body.classList.contains(
            'about-view-active'
        )
    ) {

        return;

    }


    const aboutImage =
        document.getElementById(
            'aboutLogoImage'
        );


    if (
        !aboutImage
    ) {

        return;

    }


    const rect =
        aboutImage.getBoundingClientRect();


    if (
        rect.width <= 0 ||
        rect.height <= 0
    ) {

        return;

    }


    const centerX =
        rect.left +
        (
            rect.width /
            2
        );


    const centerY =
        rect.top +
        (
            rect.height /
            2
        );


    labLogo.style.setProperty(
        '--about-logo-center-x',
        centerX + 'px'
    );


    labLogo.style.setProperty(
        '--about-logo-center-y',
        centerY + 'px'
    );

}


function scheduleAboutLogoCenterSync() {

    if (
        rootAboutSyncFrame
    ) {

        cancelAnimationFrame(
            rootAboutSyncFrame
        );

    }


    rootAboutSyncFrame =
        requestAnimationFrame(
            () => {

                rootAboutSyncFrame =
                    null;


                syncLogoToAboutImage();

            }
        );

}


/*
 * Scroll:
 * If the document moves for any reason,
 * recalculate against the real image coordinates.
 */

window.addEventListener(
    'scroll',
    scheduleAboutLogoCenterSync,
    {
        passive:
            true
    }
);


/*
 * Resize / browser zoom / devtools resize.
 */

window.addEventListener(
    'resize',
    scheduleAboutLogoCenterSync
);


/*
 * Recalculate after image loading.
 */

document.addEventListener(
    'load',
    event => {

        if (
            event.target &&
            event.target.id ===
            'aboutLogoImage'
        ) {

            scheduleAboutLogoCenterSync();


            requestAnimationFrame(
                scheduleAboutLogoCenterSync
            );

        }

    },
    true
);


/*
 * showAbout() dynamically inserts the image,
 * so watch for that insertion as well.
 */

const rootAboutObserver =
    new MutationObserver(
        () => {

            if (
                document.body.classList.contains(
                    'about-view-active'
                )
            ) {

                scheduleAboutLogoCenterSync();

            }

        }
    );


rootAboutObserver.observe(
    document.body,
    {
        childList:
            true,

        subtree:
            true
    }
);


/* ROOT ABOUT IMAGE TRACKING V6 END */

// ============================================================
// MUSIC
// ============================================================

function setupMusic() {

    if (
        !musicControl ||
        !backgroundMusic
    ) {

        return;

    }


    backgroundMusic.src =
        storageUrl(
            AUDIO_PATH
        );


    backgroundMusic.loop =
        true;


    backgroundMusic.preload =
        'auto';


    function updateButton() {

        musicControl.innerHTML =
            isMusicPlaying

                ? '<i class="fas fa-pause"></i>'

                : '<i class="fas fa-music"></i>';

    }


    
    /* ROOT DIRECT MUSIC 1 V20-LITE */
    backgroundMusic.volume =
        0.01;

async function tryPlay() {

        try {

            await backgroundMusic.play();

            isMusicPlaying =
                true;

            updateButton();

        }
        catch {

            isMusicPlaying =
                false;

            updateButton();

        }

    }


    musicControl.addEventListener(
        'click',
        async event => {

            event.stopPropagation();


            if (
                backgroundMusic.paused
            ) {

                await tryPlay();

            }

            else {

                backgroundMusic.pause();

            }

        }
    );


    backgroundMusic.addEventListener(
        'play',
        () => {

            isMusicPlaying =
                true;

            updateButton();

        }
    );


    backgroundMusic.addEventListener(
        'pause',
        () => {

            isMusicPlaying =
                false;

            updateButton();

        }
    );


    document.addEventListener(
        'pointerdown',
        () => {

            if (
                backgroundMusic.paused
            ) {

                tryPlay();

            }

        },
        {
            once: true,
            passive: true
        }
    );


    updateButton();

    tryPlay();
}


// ============================================================
// INIT
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        setupMusic();

        setupProjectToolbar();

        setupNavButtons();

        await loadPublicSiteConfig();
        // ROOT LOGO CACHE FIX
        const rootLogoImage =
            labLogo
                ? labLogo.querySelector('img')
                : null;

        if (rootLogoImage) {

            rootLogoImage.src =
                storageUrl(
                    LAB_LOGO_PATH
                );

        }


        setLogoPosition(
            'left'
        );


        if (
            pricingScrollContainer
        ) {

            pricingScrollContainer.style.display =
                'none';

        }


        /*
         * قراءة المشاريع مرة واحدة.
         */

        try {

            await ensureProjectsLoaded();

            renderProjects();

        }

        catch (error) {

            console.error(
                'Initial projects load failed:',
                error
            );


            if (
                heroGrid
            ) {

                heroGrid.innerHTML = `

                    <div
                        class="empty-hint"
                        style="grid-column:1/-1;"
                    >

                        <i
                            class="fas fa-triangle-exclamation"
                        ></i>

                        <p>
                            تعذر تحميل المشاريع
                        </p>

                    </div>

                `;

            }

        }


        window.addEventListener(
            'resize',
            centerPricingScroll
        );

    }
);


/* ============================================================
   ROOT NARRATOR HOTFIX V13C

   IMPORTANT:
   Uses the existing #labLogo.
   The bubble itself is attached to document.body.
   ============================================================ */


/*
 * Override the old version.
 * No dependency on viewerOverlay/imageViewer.
 */
function rootEnsureNarratorBubble() {

    let wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    if (
        !wrap
    ) {

        wrap =
            document.createElement(
                'div'
            );


        wrap.id =
            'rootLogoNarrator';


        wrap.className =
            'root-logo-narrator';


        wrap.innerHTML = `

            <div
                class="root-narrator-bubble"
                id="rootNarratorBubble"
            >

                <div
                    class="root-narrator-brand"
                    id="rootNarratorBrand"
                >
                    ROOT dent
                </div>

                <div
                    class="root-narrator-text"
                    id="rootNarratorText"
                    dir="auto"
                ></div>

            </div>

        `;


        document.body.appendChild(
            wrap
        );

    }


    const brand =
        document.getElementById(
            'rootNarratorBrand'
        );


    if (
        brand
    ) {

        let brandName =
            'ROOT dent';


        if (
            typeof publicSiteConfig !==
                'undefined'
            &&
            publicSiteConfig?.brandName
        ) {

            brandName =
                publicSiteConfig.brandName;

        }

        else if (
            document.title
        ) {

            brandName =
                document.title;

        }


        brand.textContent =
            brandName;

    }


    if (
        typeof rootNarratorResizeBound !==
            'undefined'
        &&
        !rootNarratorResizeBound
    ) {

        rootNarratorResizeBound =
            true;


        window.addEventListener(
            'resize',
            rootPositionNarratorBubble
        );


        window.addEventListener(
            'scroll',
            rootPositionNarratorBubble,
            {
                passive: true
            }
        );

    }


    rootPositionNarratorBubble();


    requestAnimationFrame(
        rootPositionNarratorBubble
    );


    return wrap;

}


/*
 * Use the description shown in the viewer.
 * Ignore boring automatically generated "media 1" names.
 */
function rootNarratorCustomText(
    item
) {

    const text =
        String(
            item?.desc || ''
        )
        .trim();


    if (
        !text
    ) {

        return '';

    }


    const genericMedia =
        /^media(?:[\s_-]*\d+)?$/i;


    if (
        genericMedia.test(
            text
        )
    ) {

        return '';

    }


    return text;

}


/*
 * More reliable positioning next to the existing logo.
 */
function rootPositionNarratorBubble() {

    const wrap =
        document.getElementById(
            'rootLogoNarrator'
        );


    const logo =
        document.getElementById(
            'labLogo'
        );


    if (
        !wrap ||
        !logo
    ) {

        return;

    }


    const rect =
        logo.getBoundingClientRect();


    /*
     * Mobile:
     * put the message below the existing logo.
     */
    if (
        window.innerWidth <=
        700
    ) {

        wrap.style.left =
            '12px';

        wrap.style.right =
            '12px';

        wrap.style.top =
            `${Math.min(
                window.innerHeight - 175,
                rect.bottom + 12
            )}px`;

        wrap.style.transform =
            'none';

        return;

    }


    const centerX =
        rect.left +
        rect.width / 2;


    /*
     * Logo on left.
     */
    if (
        centerX <
        window.innerWidth /
        2
    ) {

        wrap.style.left =
            `${rect.right + 18}px`;

        wrap.style.right =
            'auto';

        wrap.style.top =
            `${
                rect.top +
                rect.height / 2
            }px`;

        wrap.style.transform =
            'translateY(-50%)';

        return;

    }


    /*
     * Logo on right.
     */
    wrap.style.left =
        'auto';

    wrap.style.right =
        `${
            window.innerWidth -
            rect.left +
            18
        }px`;

    wrap.style.top =
        `${
            rect.top +
            rect.height / 2
        }px`;

    wrap.style.transform =
        'translateY(-50%)';

}


/*
 * Make speech more dependable if voices arrive late.
 */
function rootSpeakNarrator(
    text,
    token
) {

    const value =
        String(
            text || ''
        )
        .trim();


    if (
        !value ||
        !(
            'speechSynthesis' in
            window
        )
    ) {

        return;

    }


    const language =
        rootNarratorLanguage(
            value
        );


    const startSpeaking =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {

                return;

            }


            const speech =
                new SpeechSynthesisUtterance(
                    value
                );


            speech.lang =
                language;


            speech.rate =
                .94;


            speech.pitch =
                1;


            const voices =
                window
                .speechSynthesis
                .getVoices();


            const prefix =
                language
                .split('-')[0]
                .toLowerCase();


            const voice =
                voices.find(
                    item =>
                        String(
                            item.lang ||
                            ''
                        )
                        .toLowerCase() ===
                        language.toLowerCase()
                )
                ||
                voices.find(
                    item =>
                        String(
                            item.lang ||
                            ''
                        )
                        .toLowerCase()
                        .startsWith(
                            prefix
                        )
                );


            if (
                voice
            ) {

                speech.voice =
                    voice;

            }


            speech.onstart =
                () => {

                    if (
                        token !==
                        rootNarratorToken
                    ) {

                        return;

                    }


                    document
                        .getElementById(
                            'labLogo'
                        )
                        ?.classList
                        .add(
                            'root-narrator-speaking'
                        );

                };


            const stopPulse =
                () => {

                    if (
                        token !==
                        rootNarratorToken
                    ) {

                        return;

                    }


                    document
                        .getElementById(
                            'labLogo'
                        )
                        ?.classList
                        .remove(
                            'root-narrator-speaking'
                        );

                };


            speech.onend =
                stopPulse;


            speech.onerror =
                stopPulse;


            window
                .speechSynthesis
                .cancel();


            window
                .speechSynthesis
                .speak(
                    speech
                );

        };


    const voices =
        window
        .speechSynthesis
        .getVoices();


    if (
        voices.length
    ) {

        startSpeaking();

        return;

    }


    /*
     * Some browsers populate voices asynchronously.
     */
    setTimeout(
        startSpeaking,
        120
    );

}


/*
 * Re-define announce to guarantee UI + speech.
 */
function rootNarratorAnnounce(
    viewerItem
) {

    const text =
        rootNarratorCustomText(
            viewerItem
        );


    const wrap =
        rootEnsureNarratorBubble();


    const textElement =
        document.getElementById(
            'rootNarratorText'
        );


    const oldText =
        textElement
            ?.textContent
            ?.trim() ||
        '';


    rootNarratorStop(
        false
    );


    if (
        !text
    ) {

        if (
            textElement
        ) {

            textElement.textContent =
                '';

        }


        wrap?.classList.remove(
            'show'
        );


        return;

    }


    if (
        oldText &&
        oldText !==
            text
    ) {

        rootAnimateOldNarratorMessage(
            oldText
        );

    }


    wrap?.classList.add(
        'show'
    );


    rootPositionNarratorBubble();


    const token =
        ++rootNarratorToken;


    rootTypeNarrator(
        text,
        token
    );


    rootSpeakNarrator(
        text,
        token
    );

}


/* ROOT NARRATOR HOTFIX V13C END */


/* ============================================================
   ROOT MOBILE BACK GUARD V14
   ============================================================ */

let rootLastBackAttempt =
    0;


let rootBackGuardActive =
    false;


function rootIsMobileNavigation() {

    return (
        window.matchMedia(
            '(pointer: coarse)'
        ).matches
        ||
        window.innerWidth <=
            800
    );

}


function rootShowBackToast(
    message
) {

    let toast =
        document.getElementById(
            'rootBackToast'
        );


    if (
        !toast
    ) {

        toast =
            document.createElement(
                'div'
            );


        toast.id =
            'rootBackToast';


        toast.className =
            'root-back-toast';


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.remove(
        'show'
    );


    void toast.offsetWidth;


    toast.classList.add(
        'show'
    );


    clearTimeout(
        toast.rootHideTimer
    );


    toast.rootHideTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    'show'
                );

            },
            1800
        );

}


function rootViewerIsOpen() {

    const viewer =
        document.getElementById(
            'viewerOverlay'
        );


    if (
        !viewer
    ) {

        return false;

    }


    return (
        getComputedStyle(
            viewer
        ).display !==
        'none'
    );

}


function rootProjectIsOpen() {

    const modal =
        document.getElementById(
            'projectModal'
        );


    if (
        !modal
    ) {

        return false;

    }


    return (
        getComputedStyle(
            modal
        ).display !==
        'none'
    );

}


function rootPricingIsOpen() {

    const pricing =
        document.getElementById(
            'pricingScrollContainer'
        );


    if (
        !pricing
    ) {

        return false;

    }


    return (
        getComputedStyle(
            pricing
        ).display !==
        'none'
    );

}


function rootPushBackGuard() {

    history.pushState(
        {
            rootDentalGuard:
                true
        },
        '',
        location.href
    );


    rootBackGuardActive =
        true;

}


function rootMobileBackHandler(
    event
) {

    if (
        !rootIsMobileNavigation()
    ) {

        return;

    }


    /*
     * Viewer open:
     * hardware/browser back closes the image only.
     */
    if (
        rootViewerIsOpen()
    ) {

        if (
            typeof closeViewer ===
            'function'
        ) {

            closeViewer();

        }


        rootPushBackGuard();

        return;

    }


    /*
     * Project modal open:
     * close the project only.
     */
    if (
        rootProjectIsOpen()
    ) {

        const modal =
            document.getElementById(
                'projectModal'
            );


        if (
            typeof hideOverlay ===
                'function'
        ) {

            hideOverlay(
                modal
            );

        }

        else {

            modal.style.display =
                'none';

        }


        rootPushBackGuard();

        return;

    }


    /*
     * About page:
     * Back returns to Products.
     */
    if (
        document.body
            .classList
            .contains(
                'about-view-active'
            )
    ) {

        if (
            typeof showProducts ===
                'function'
        ) {

            showProducts();

        }


        rootPushBackGuard();

        return;

    }


    /*
     * Pricing:
     * Back returns to Products.
     */
    if (
        rootPricingIsOpen()
    ) {

        if (
            typeof showProducts ===
                'function'
        ) {

            showProducts();

        }


        rootPushBackGuard();

        return;

    }


    /*
     * Main Products page:
     * Require two back presses within 2 seconds.
     */
    const now =
        Date.now();


    if (
        now -
        rootLastBackAttempt <
        2000
    ) {

        window.removeEventListener(
            'popstate',
            rootMobileBackHandler
        );


        history.back();

        return;

    }


    rootLastBackAttempt =
        now;


    rootShowBackToast(
        'اضغط رجوع مرة أخرى للخروج'
    );


    rootPushBackGuard();

}


function rootInitMobileBackGuard() {

    if (
        !rootIsMobileNavigation()
    ) {

        return;

    }


    if (
        !history.state?.rootDentalGuard
    ) {

        rootPushBackGuard();

    }


    window.addEventListener(
        'popstate',
        rootMobileBackHandler
    );

}


window.addEventListener(
    'load',
    rootInitMobileBackGuard
);


/* ROOT MOBILE BACK GUARD V14 END */


/* ============================================================
   ROOT FIXED MUSIC VOLUME 25 V15
   ============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        const audio =
            document.getElementById(
                'backgroundMusic'
            );


        if (
            !audio
        ) {
            return;
        }


        const enforceMusicVolume =
            () => {

                if (
                    Math.abs(
                        audio.volume -
                        0.25
                    ) >
                    0.001
                ) {

                    audio.volume =
                        0.25;

                }

            };


        /*
         * 25% permanently.
         */
        enforceMusicVolume();


        audio.addEventListener(
            'play',
            enforceMusicVolume
        );


        audio.addEventListener(
            'loadedmetadata',
            enforceMusicVolume
        );


        audio.addEventListener(
            'volumechange',
            enforceMusicVolume
        );

    }
);

/* ROOT FIXED MUSIC VOLUME 13 V16 END */


/* ============================================================
   ROOT SPEECH RHYTHM LOGO V16

   The EXISTING logo circle scales according to speech rhythm.
   Uses SpeechSynthesis word-boundary timing when available.
   ============================================================ */

let rootSpeechLogoAnimation =
    null;

let rootSpeechFallbackTimer =
    null;

let rootSpeechLastBoundaryMs =
    0;


/*
 * Reset only the speech scale.
 * Does NOT touch the positioning transform of #labLogo.
 */
function rootResetSpeechLogoMotion() {

    if (
        rootSpeechLogoAnimation
    ) {

        try {
            rootSpeechLogoAnimation.cancel();
        }
        catch {}

        rootSpeechLogoAnimation =
            null;

    }


    if (
        rootSpeechFallbackTimer
    ) {

        clearTimeout(
            rootSpeechFallbackTimer
        );

        rootSpeechFallbackTimer =
            null;

    }


    rootSpeechLastBoundaryMs =
        0;


    const logo =
        document.getElementById(
            'labLogo'
        );


    if (
        logo
    ) {

        logo.style.scale =
            '';

        logo.classList.remove(
            'root-narrator-speaking'
        );

    }

}


function rootClamp(
    value,
    min,
    max
) {

    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );

}


function rootSpeechWordInfo(
    text,
    charIndex
) {

    const source =
        String(
            text || ''
        );


    const start =
        Math.max(
            0,
            Number(
                charIndex
            ) || 0
        );


    const tail =
        source.slice(
            start
        );


    const match =
        tail.match(
            /^\s*([^\s،,.;!?؟:]+)/u
        );


    const word =
        match?.[1] ||
        '';


    const consumed =
        match?.[0]?.length ||
        0;


    const after =
        tail.slice(
            consumed
        );


    const pauseAfter =
        /^[\s]*[،,.;!?؟:]/u.test(
            after
        );


    return {
        word,
        pauseAfter
    };

}


/*
 * Pulse the OUTER logo circle.
 *
 * CSS individual "scale" is used so it does not conflict
 * with the existing transform used to position the logo.
 */
function rootPulseLogoWithSpeech(
    text,
    charIndex,
    elapsedTime
) {

    const logo =
        document.getElementById(
            'labLogo'
        );


    if (
        !logo
    ) {

        return;

    }


    const info =
        rootSpeechWordInfo(
            text,
            charIndex
        );


    const elapsedMs =
        Number(
            elapsedTime || 0
        ) *
        1000;


    let gap =
        rootSpeechLastBoundaryMs > 0
            ?
            (
                elapsedMs -
                rootSpeechLastBoundaryMs
            )
            :
            270;


    if (
        !Number.isFinite(
            gap
        )
        ||
        gap <= 0
    ) {

        gap =
            270;

    }


    rootSpeechLastBoundaryMs =
        elapsedMs;


    /*
     * Word length affects amplitude slightly.
     * Faster speech cadence increases it slightly.
     * Punctuation softens it.
     */
    const wordPower =
        rootClamp(
            info.word.length *
            .0055,
            .012,
            .055
        );


    const cadencePower =
        gap < 200
            ? .018
            :
        gap < 300
            ? .010
            :
        gap > 500
            ? -.008
            :
            0;


    const pausePower =
        info.pauseAfter
            ? -.012
            : 0;


    const peakScale =
        rootClamp(
            1.045 +
            wordPower +
            cadencePower +
            pausePower,
            1.045,
            1.125
        );


    let duration =
        rootClamp(
            gap *
            .82,
            150,
            430
        );


    if (
        info.pauseAfter
    ) {

        duration =
            Math.min(
                500,
                duration *
                1.18
            );

    }


    if (
        rootSpeechLogoAnimation
    ) {

        try {
            rootSpeechLogoAnimation.cancel();
        }
        catch {}

    }


    if (
        typeof logo.animate ===
        'function'
    ) {

        rootSpeechLogoAnimation =
            logo.animate(
                [
                    {
                        scale:
                            '1',
                        offset:
                            0
                    },

                    {
                        scale:
                            String(
                                peakScale
                            ),
                        offset:
                            .36
                    },

                    {
                        scale:
                            '1',
                        offset:
                            1
                    }
                ],
                {
                    duration:
                        duration,

                    easing:
                        'cubic-bezier(.25,.7,.25,1)',

                    fill:
                        'none'
                }
            );

    }

    else {

        logo.style.transition =
            `scale ${Math.round(
                duration *
                .45
            )}ms ease-out`;


        logo.style.scale =
            String(
                peakScale
            );


        setTimeout(
            () => {

                logo.style.scale =
                    '1';

            },
            duration *
            .45
        );

    }

}


/*
 * Override the previous narrator stop so speech motion
 * always returns smoothly to normal size.
 */
function rootNarratorStop(
    hide = false
) {

    rootNarratorToken++;


    if (
        rootNarratorTypingTimer
    ) {

        clearTimeout(
            rootNarratorTypingTimer
        );

        rootNarratorTypingTimer =
            null;

    }


    if (
        'speechSynthesis' in
        window
    ) {

        window
            .speechSynthesis
            .cancel();

    }


    rootResetSpeechLogoMotion();


    if (
        hide
    ) {

        const wrap =
            document.getElementById(
                'rootLogoNarrator'
            );


        wrap?.classList.remove(
            'show'
        );

    }

}


/*
 * Narrator speech synchronized with word boundaries.
 */
function rootSpeakNarrator(
    text,
    token
) {

    const value =
        String(
            text || ''
        )
        .trim();


    if (
        !value ||
        !(
            'speechSynthesis' in
            window
        )
    ) {

        return;

    }


    rootResetSpeechLogoMotion();


    const language =
        rootNarratorLanguage(
            value
        );


    const speech =
        new SpeechSynthesisUtterance(
            value
        );


    speech.lang =
        language;


    speech.rate =
        .94;


    speech.pitch =
        1;


    speech.volume =
        1;


    const voices =
        window
            .speechSynthesis
            .getVoices();


    const prefix =
        language
            .split(
                '-'
            )[0]
            .toLowerCase();


    const voice =
        voices.find(
            item =>
                String(
                    item.lang ||
                    ''
                )
                .toLowerCase() ===
                language
                    .toLowerCase()
        )
        ||
        voices.find(
            item =>
                String(
                    item.lang ||
                    ''
                )
                .toLowerCase()
                .startsWith(
                    prefix
                )
        );


    if (
        voice
    ) {

        speech.voice =
            voice;

    }


    let boundaryReceived =
        false;


    let fallbackWordIndex =
        0;


    const fallbackWords =
        [
            ...value.matchAll(
                /\S+/gu
            )
        ];


    speech.onstart =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {
                return;
            }


            const logo =
                document.getElementById(
                    'labLogo'
                );


            logo?.classList.add(
                'root-narrator-speaking'
            );


            /*
             * Wait briefly for real word-boundary events.
             * If browser does not provide them, use a
             * deterministic fallback rhythm.
             */
            const fallbackPulse =
                () => {

                    if (
                        token !==
                        rootNarratorToken ||
                        boundaryReceived
                    ) {

                        return;

                    }


                    if (
                        fallbackWordIndex >=
                        fallbackWords.length
                    ) {

                        return;

                    }


                    const item =
                        fallbackWords[
                            fallbackWordIndex
                        ];


                    rootPulseLogoWithSpeech(
                        value,
                        item.index,
                        (
                            fallbackWordIndex *
                            .31
                        )
                    );


                    fallbackWordIndex++;


                    rootSpeechFallbackTimer =
                        setTimeout(
                            fallbackPulse,
                            310
                        );

                };


            rootSpeechFallbackTimer =
                setTimeout(
                    fallbackPulse,
                    500
                );

        };


    speech.onboundary =
        event => {

            if (
                token !==
                rootNarratorToken
            ) {

                return;

            }


            boundaryReceived =
                true;


            if (
                rootSpeechFallbackTimer
            ) {

                clearTimeout(
                    rootSpeechFallbackTimer
                );

                rootSpeechFallbackTimer =
                    null;

            }


            /*
             * Chrome exposes word boundaries here.
             */
            rootPulseLogoWithSpeech(
                value,
                event.charIndex,
                event.elapsedTime
            );

        };


    const finish =
        () => {

            if (
                token !==
                rootNarratorToken
            ) {

                return;

            }


            rootResetSpeechLogoMotion();

        };


    speech.onend =
        finish;


    speech.onerror =
        finish;


    window
        .speechSynthesis
        .cancel();


    /*
     * Some browsers populate voices slightly later.
     */
    if (
        voices.length
    ) {

        window
            .speechSynthesis
            .speak(
                speech
            );

    }

    else {

        setTimeout(
            () => {

                if (
                    token ===
                    rootNarratorToken
                ) {

                    window
                        .speechSynthesis
                        .speak(
                            speech
                        );

                }

            },
            120
        );

    }

}

/* ROOT SPEECH RHYTHM LOGO V16 END */



/* ============================================================
   ROOT LIGHT TAB NARRATOR V19.1
   RAPID NAVIGATION SAFE
   ============================================================ */

const ROOT_TAB_INTRO_PATH =
    `${TENANT_ROOT}/config/tab-intros.json`;


let rootTabIntroConfig = {

    products:
        '',

    about:
        '',

    pricing:
        ''

};


/*
 * Every tab change gets a new generation number.
 * Old async work becomes invalid immediately.
 */
let rootTabNavGeneration =
    0;


let rootTabNarrationActive =
    false;


let rootTabWaitTimer =
    0;


/* ============================================================
   CONFIG
   ============================================================ */

async function rootLoadTabIntroConfig() {

    try {

        const response =
            await fetch(
                storageUrl(
                    ROOT_TAB_INTRO_PATH
                ),
                {
                    cache:
                        'no-store'
                }
            );


        if (
            !response.ok
        ) {

            return;

        }


        const data =
            await response.json();


        rootTabIntroConfig = {

            ...rootTabIntroConfig,

            ...data

        };

    }

    catch (error) {

        console.warn(
            'Tab narration config load failed:',
            error
        );

    }

}


/* ============================================================
   CANCEL
   ============================================================ */

function rootCancelCurrentTabNarration(
    stopSpeech = true
) {

    /*
     * Invalidates EVERYTHING scheduled previously.
     */
    rootTabNavGeneration++;


    if (
        rootTabWaitTimer
    ) {

        clearTimeout(
            rootTabWaitTimer
        );


        rootTabWaitTimer =
            0;

    }


    if (
        stopSpeech
    ) {

        rootTabNarrationActive =
            false;


        if (
            typeof rootNarratorStop ===
            'function'
        ) {

            rootNarratorStop(
                true
            );

        }

    }

}


/* ============================================================
   TAB MAP
   ============================================================ */

function rootGetTabInfo(
    button
) {

    if (!button) {
        return null;
    }


    switch (
        button.id
    ) {

        case 'navProductsBtn':

            return {

                key:
                    'products',

                buttonId:
                    'navProductsBtn'

            };


        case 'navAboutBtn':

            return {

                key:
                    'about',

                buttonId:
                    'navAboutBtn'

            };


        case 'navPricingBtn':

            return {

                key:
                    'pricing',

                buttonId:
                    'navPricingBtn'

            };


        default:

            return null;

    }

}


/* ============================================================
   ANIMATION HELPERS
   ============================================================ */

function rootIsNarratorRelatedElement(
    element
) {

    if (
        !element
    ) {
        return false;
    }


    /*
     * Never wait for the About page's big image animation.
     */
    if (
        element.id ===
        'aboutLogoImage'
        ||
        element.closest?.(
            '.about-image-container'
        )
    ) {

        return false;

    }


    /*
     * Never wait for the speech bubble's own animations.
     */
    if (
        element.closest?.(
            '#rootLogoNarrator'
        )
    ) {

        return false;

    }


    const logo =
        document.getElementById(
            'labLogo'
        );


    if (
        element === logo
        ||
        logo?.contains(
            element
        )
    ) {

        return true;

    }


    const descriptor =
        `${
            element.id || ''
        } ${
            typeof element.className ===
                'string'
                ?
                element.className
                :
                ''
        }`
        .toLowerCase();


    /*
     * Also catches temporary logo clones
     * used by the existing flying animation.
     */
    return (
        descriptor.includes(
            'logo'
        )
        &&
        !descriptor.includes(
            'about'
        )
        &&
        !descriptor.includes(
            'narrator'
        )
    );

}


function rootGetRunningLogoAnimations() {

    if (
        typeof document.getAnimations !==
        'function'
    ) {

        return [];

    }


    return document
        .getAnimations()
        .filter(
            animation => {

                if (
                    animation.playState !==
                    'running'
                    &&
                    animation.playState !==
                    'pending'
                ) {

                    return false;

                }


                const target =
                    animation.effect
                        ?.target;


                if (
                    !rootIsNarratorRelatedElement(
                        target
                    )
                ) {

                    return false;

                }


                /*
                 * Ignore permanent decorative loops.
                 */
                try {

                    const timing =
                        animation.effect
                            ?.getTiming?.();


                    if (
                        timing?.iterations ===
                        Infinity
                    ) {

                        return false;

                    }

                }

                catch {}


                return true;

            }
        );

}


/*
 * Used only when the browser exposes no running animation.
 * Reads the logo's real CSS transition length once.
 */
function rootGetLogoFallbackDelay() {

    const logo =
        document.getElementById(
            'labLogo'
        );


    if (!logo) {
        return 850;
    }


    const style =
        getComputedStyle(
            logo
        );


    function toMilliseconds(
        value
    ) {

        const text =
            String(
                value || ''
            ).trim();


        if (
            text.endsWith(
                'ms'
            )
        ) {

            return (
                parseFloat(
                    text
                ) || 0
            );

        }


        if (
            text.endsWith(
                's'
            )
        ) {

            return (
                (
                    parseFloat(
                        text
                    ) || 0
                ) *
                1000
            );

        }


        return 0;

    }


    const durations =
        String(
            style.transitionDuration ||
            ''
        )
        .split(
            ','
        )
        .map(
            toMilliseconds
        );


    const delays =
        String(
            style.transitionDelay ||
            ''
        )
        .split(
            ','
        )
        .map(
            toMilliseconds
        );


    let maximum =
        0;


    const count =
        Math.max(
            durations.length,
            delays.length
        );


    for (
        let index = 0;
        index < count;
        index++
    ) {

        const duration =
            durations[
                index %
                durations.length
            ] || 0;


        const delay =
            delays[
                index %
                delays.length
            ] || 0;


        maximum =
            Math.max(
                maximum,
                duration +
                delay
            );

    }


    /*
     * If CSS gives no usable value,
     * 850ms is a safe single fallback.
     */
    if (
        maximum <
        100
    ) {

        return 850;

    }


    return Math.max(
        350,
        Math.min(
            1400,
            maximum +
            100
        )
    );

}


/* ============================================================
   WAIT FOR THE CURRENT LOGO MOTION
   ============================================================ */

async function rootWaitForCurrentLogoMotion(
    generation
) {

    /*
     * Two frames allow the existing tab code to:
     * - change classes
     * - create temporary flight clones
     * - start CSS animation
     */
    await new Promise(
        resolve =>
            requestAnimationFrame(
                resolve
            )
    );


    await new Promise(
        resolve =>
            requestAnimationFrame(
                resolve
            )
    );


    if (
        generation !==
        rootTabNavGeneration
    ) {

        return false;

    }


    const animations =
        rootGetRunningLogoAnimations();


    if (
        animations.length
    ) {

        /*
         * Wait for the animations that belong to THIS
         * final navigation.
         *
         * No polling.
         */
        const animationWait =
            Promise.allSettled(
                animations.map(
                    animation =>
                        animation.finished
                )
            );


        const safetyWait =
            new Promise(
                resolve => {

                    rootTabWaitTimer =
                        setTimeout(
                            resolve,
                            1600
                        );

                }
            );


        await Promise.race(
            [
                animationWait,
                safetyWait
            ]
        );


        if (
            rootTabWaitTimer
        ) {

            clearTimeout(
                rootTabWaitTimer
            );


            rootTabWaitTimer =
                0;

        }

    }

    else {

        /*
         * One timer only.
         * No repeating checks.
         */
        await new Promise(
            resolve => {

                rootTabWaitTimer =
                    setTimeout(
                        resolve,
                        rootGetLogoFallbackDelay()
                    );

            }
        );


        rootTabWaitTimer =
            0;

    }


    return (
        generation ===
        rootTabNavGeneration
    );

}


/* ============================================================
   START FINAL TAB NARRATION
   ============================================================ */

async function rootScheduleFinalTabNarration(
    button,
    key
) {

    /*
     * Cancels old About / Products / Pricing requests.
     */
    rootCancelCurrentTabNarration(
        true
    );


    const generation =
        rootTabNavGeneration;


    const text =
        String(
            rootTabIntroConfig[
                key
            ] ||
            ''
        )
        .trim();


    if (
        !text
    ) {

        return;

    }


    const finished =
        await rootWaitForCurrentLogoMotion(
            generation
        );


    if (
        !finished
        ||
        generation !==
            rootTabNavGeneration
    ) {

        return;

    }


    /*
     * Most important race-condition check.
     *
     * If another tab became active,
     * this narration is DEAD.
     */
    if (
        !button.classList.contains(
            'active'
        )
    ) {

        return;

    }


    /*
     * Small final settle only.
     */
    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                55
            )
    );


    if (
        generation !==
        rootTabNavGeneration
        ||
        !button.classList.contains(
            'active'
        )
    ) {

        return;

    }


    rootTabNarrationActive =
        true;


    if (
        typeof rootNarratorAnnounce ===
        'function'
    ) {

        rootNarratorAnnounce({

            name:
                `tab-${key}`,

            desc:
                text

        });

    }


    /*
     * Force a fresh position AFTER the final logo
     * has reached its real destination.
     */
    requestAnimationFrame(
        () => {

            requestAnimationFrame(
                () => {

                    if (
                        generation !==
                        rootTabNavGeneration
                    ) {

                        return;

                    }


                    if (
                        typeof rootPositionNarratorBubble ===
                        'function'
                    ) {

                        rootPositionNarratorBubble();

                    }

                    else if (
                        typeof rootPositionNarrator ===
                        'function'
                    ) {

                        rootPositionNarrator();

                    }

                }
            );

        }
    );

}


/* ============================================================
   INTERACTION
   ============================================================ */

/*
 * pointerdown happens before click.
 *
 * So rapid navigation immediately kills:
 * - old speech
 * - old Bubble
 * - old pending timer
 * - old async animation Promise
 */
document.addEventListener(
    'pointerdown',
    event => {

        const nav =
            event.target
                ?.closest?.(
                    '.nav-btn'
                );


        if (
            nav
        ) {

            rootCancelCurrentTabNarration(
                true
            );


            return;

        }


        /*
         * Any normal interaction inside the page
         * stops the current tab explanation.
         */
        if (
            rootTabNarrationActive
        ) {

            rootCancelCurrentTabNarration(
                true
            );

        }

    },
    true
);


/*
 * IMPORTANT:
 * This listener is on document bubble phase.
 *
 * Existing button click code executes FIRST.
 * Therefore the original tab animation is already started
 * when we schedule narration.
 */
document.addEventListener(
    'click',
    event => {

        const button =
            event.target
                ?.closest?.(
                    '.nav-btn'
                );


        const info =
            rootGetTabInfo(
                button
            );


        if (
            !info
        ) {

            return;

        }


        rootScheduleFinalTabNarration(
            button,
            info.key
        );

    }
);


/* ============================================================
   CONFIG LOAD
   ============================================================ */

rootLoadTabIntroConfig();

/* ROOT LIGHT TAB NARRATOR V19 END */


