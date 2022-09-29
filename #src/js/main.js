function DynamicAdapt(type) {
    this.type = type;
}

DynamicAdapt.prototype.init = function () {
    const _this = this;
    // массив объектов
    this.оbjects = [];
    this.daClassname = "_dynamic_adapt_";
    // массив DOM-элементов
    this.nodes = document.querySelectorAll("[data-da]");

    // наполнение оbjects объктами
    for (let i = 0; i < this.nodes.length; i++) {
        const node = this.nodes[i];
        const data = node.dataset.da.trim();
        const dataArray = data.split(",");
        const оbject = {};
        оbject.element = node;
        оbject.parent = node.parentNode;
        оbject.destination = document.querySelector(dataArray[0].trim());
        оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : "767";
        оbject.place = dataArray[2] ? dataArray[2].trim() : "last";
        оbject.index = this.indexInParent(оbject.parent, оbject.element);
        this.оbjects.push(оbject);
    }


    this.arraySort(this.оbjects);

    // массив уникальных медиа-запросов
    this.mediaQueries = Array.prototype.map.call(this.оbjects, function (item) {
        return '(' + this.type + "-width: " + item.breakpoint + "px)," + item.breakpoint;
    }, this);
    this.mediaQueries = Array.prototype.filter.call(this.mediaQueries, function (item, index, self) {
        return Array.prototype.indexOf.call(self, item) === index;
    });

    // навешивание слушателя на медиа-запрос
    // и вызов обработчика при первом запуске
    for (let i = 0; i < this.mediaQueries.length; i++) {
        const media = this.mediaQueries[i];
        const mediaSplit = String.prototype.split.call(media, ',');
        const matchMedia = window.matchMedia(mediaSplit[0]);
        const mediaBreakpoint = mediaSplit[1];

        // массив объектов с подходящим брейкпоинтом
        const оbjectsFilter = Array.prototype.filter.call(this.оbjects, function (item) {
            return item.breakpoint === mediaBreakpoint;
        });
        matchMedia.addListener(function () {
            _this.mediaHandler(matchMedia, оbjectsFilter);
        });
        this.mediaHandler(matchMedia, оbjectsFilter);
    }
};

DynamicAdapt.prototype.mediaHandler = function (matchMedia, оbjects) {
    if (matchMedia.matches) {
        for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            оbject.index = this.indexInParent(оbject.parent, оbject.element);
            this.moveTo(оbject.place, оbject.element, оbject.destination);
        }
    } else {
        for (let i = 0; i < оbjects.length; i++) {
            const оbject = оbjects[i];
            if (оbject.element.classList.contains(this.daClassname)) {
                this.moveBack(оbject.parent, оbject.element, оbject.index);
            }
        }
    }
};

// Функция перемещения
DynamicAdapt.prototype.moveTo = function (place, element, destination) {
    element.classList.add(this.daClassname);
    if (place === 'last' || place >= destination.children.length) {
        destination.insertAdjacentElement('beforeend', element);
        return;
    }
    if (place === 'first') {
        destination.insertAdjacentElement('afterbegin', element);
        return;
    }
    destination.children[place].insertAdjacentElement('beforebegin', element);
}

// Функция возврата
DynamicAdapt.prototype.moveBack = function (parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== undefined) {
        parent.children[index].insertAdjacentElement('beforebegin', element);
    } else {
        parent.insertAdjacentElement('beforeend', element);
    }
}

// Функция получения индекса внутри родителя
DynamicAdapt.prototype.indexInParent = function (parent, element) {
    const array = Array.prototype.slice.call(parent.children);
    return Array.prototype.indexOf.call(array, element);
};

// Функция сортировки массива по breakpoint и place 
// по возрастанию для this.type = min
// по убыванию для this.type = max
DynamicAdapt.prototype.arraySort = function (arr) {
    if (this.type === "min") {
        Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
                if (a.place === b.place) {
                    return 0;
                }

                if (a.place === "first" || b.place === "last") {
                    return -1;
                }

                if (a.place === "last" || b.place === "first") {
                    return 1;
                }

                return a.place - b.place;
            }

            return a.breakpoint - b.breakpoint;
        });
    } else {
        Array.prototype.sort.call(arr, function (a, b) {
            if (a.breakpoint === b.breakpoint) {
                if (a.place === b.place) {
                    return 0;
                }

                if (a.place === "first" || b.place === "last") {
                    return 1;
                }

                if (a.place === "last" || b.place === "first") {
                    return -1;
                }

                return b.place - a.place;
            }

            return b.breakpoint - a.breakpoint;
        });
        return;
    }
};

const da = new DynamicAdapt("max");
da.init();

//=================
//Unlock

let unlock = true;

//=================
//BodyLock

function body_lock(delay) {
    let body = document.querySelector("body");
    if (body.classList.contains('_lock')) {
        body_lock_remove(delay);
    } else {
        body_lock_add(delay);
    }
}
function body_lock_remove(delay) {
    let body = document.querySelector("body");
    if (unlock) {
        let lock_padding = document.querySelectorAll("._lp");
        setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            body.classList.remove("_lock");
        }, delay);

        unlock = false;
        setTimeout(function () {
            unlock = true;
        }, delay);
    }
}
function body_lock_add(delay) {
    let body = document.querySelector("body");
    if (unlock) {
        let lock_padding = document.querySelectorAll("._lp");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        }
        body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        body.classList.add("_lock");

        unlock = false;
        setTimeout(function () {
            unlock = true;
        }, delay);
    }
}

//=================
//Menu
let iconMenu = document.querySelector(".burger-btn");
if (iconMenu != null) {
    let delay = 500;
    let menuBody = document.querySelector(".burger-menu");
    iconMenu.addEventListener("click", function (e) {
        if (unlock) {
            body_lock(delay);
            iconMenu.classList.toggle("open");
            menuBody.classList.toggle("open");
        }

        window.addEventListener('click', function (e) {
            if (menuBody.classList.contains("open")) {
                if (!e.target.closest('.burger-menu__body') &&
                    e.target.closest('.burger-menu')) {
                    menu_close();
                    body_lock_remove(delay);
                }
            }
        });
    });

};
function menu_close() {
    let iconMenu = document.querySelector(".burger-btn");
    let menuBody = document.querySelector(".burger-menu");
    iconMenu.classList.remove("open");
    menuBody.classList.remove("open");
}

function checkMenu() {
    let header = document.querySelector(".header");

    if (header !== null) {
        let menu = document.querySelector(".burger-menu");
        let menuBody = document.querySelector(".burger-menu__body");
        let headerHeight = Math.floor(header.offsetHeight);
        console.log();
        menuBody.style.top = headerHeight + 'px';
        menuBody.style.maxHeight = `calc(100% - ${headerHeight - window.pageYOffset}px)`;
    }
}

checkMenu();
window.addEventListener('resize', checkMenu);

//=================
//search

let search = document.querySelector(".header__search");

if (search !== null) {

    function searchReady() {
        document.querySelector('.header-body__left').classList.remove('left');
        const searchBtn = search.querySelector('.search__button');

        function searchBtnFun(e) {
            document.querySelector('.header-body__left').classList.add('left');
            if (search.classList.contains('search-close')) {
                search.classList.remove('search-close');
                search.classList.add('search-open');
                e.preventDefault();
            }

        }

        if (window.innerWidth <= 1100 && window.innerWidth > 768) {
            search.classList.add('search-close');
            search.classList.remove('search-open');
            searchBtn.addEventListener('click', searchBtnFun);
        } else {
            search.classList.remove('search-close');
            search.classList.remove('search-open');
            searchBtn.removeEventListener('click', searchBtnFun);
        }
    }

    searchReady();
    window.addEventListener('resize', searchReady);
}

//=================
//dropmenu

const dropMenu = document.querySelector('.menu-drop-down');

if (dropMenu !== null) {

    const dropMenuBtns = document.querySelectorAll('.menu__item._item');

    let dropMenuBlocks = null;

    function menuClose() {
        dropMenu.classList.remove('open');
        for (let index = 0; index < dropMenuBtns.length; index++) {
            let dropMenuBtn = dropMenuBtns[index];

            dropMenuBtn.classList.remove('_active');
            dropMenuBlocks[index]?.classList.remove('_active');
        }
    }

    if (dropMenuBtns.length > 0) {

        function dropMenuCall(e) {
            let delay = 500;

            function menuOpen() {
                dropMenu.classList.add('open');
            }

            function checkMenu(e) {

                if (!e.target.closest('.menu-drop-down__wrapper') &&
                    !e.target.closest('.menu__item._item')) {
                    menuClose();
                    body_lock_remove(delay);
                }
            }

            const closeBtns = document.querySelectorAll('._menu-close');

            if (closeBtns !== null) {
                for (let index = 0; index < closeBtns.length; index++) {
                    const closeBtn = closeBtns[index];
                    closeBtn.addEventListener('click', menuClose);
                }
            }

            for (let index = 0; index < dropMenuBtns.length; index++) {
                const dropMenuBtn = dropMenuBtns[index];

                if (dropMenuBlocks[index] == undefined) {
                    return false;
                }

                function dropMenuBtnHandler(e) {

                    e.preventDefault();

                    if (unlock) {
                        if (e.target.closest('.menu__item._item._active')) {
                            menuClose();
                            body_lock_remove(delay);
                        } else {
                            menuOpen();
                            body_lock_add(delay);
                        }
                    }

                    for (let index = 0; index < dropMenuBtns.length; index++) {
                        let dropMenuBtn = dropMenuBtns[index];

                        dropMenuBtn.classList.remove('_active');
                        dropMenuBlocks[index]?.classList.remove('_active');
                    }

                    if (dropMenu.classList.contains("open")) {
                        window.addEventListener('click', checkMenu);
                        dropMenuBtn.classList.add('_active');
                        dropMenuBlocks[index]?.classList.add('_active');
                    } else {
                        window.removeEventListener('click', checkMenu);
                    }
                }

                dropMenuBtn.addEventListener('click', dropMenuBtnHandler);
            }
        }
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)');

    function handleTabletChange(e) {
        if (e.matches) {
            dropMenuBlocks = document.querySelectorAll(".submenu-block");
            menuClose();
            dropMenuCall();
        } else {
            dropMenuBlocks = document.querySelectorAll(".menu-drop-down__block");
            menuClose();
            dropMenuCall();
        }
    }

    mediaQuery.addListener(handleTabletChange);
    handleTabletChange(mediaQuery);
}

//=====================
//lang

const langDrop = document.querySelector('.lang__drop');

if (langDrop !== null) {

    const langStyle = (e) => {
        if (e.target.closest('.lang__image.lang-ru')) {
            const classLangTop = document.querySelector('.lang__top .lang__image');

            e.target.closest('.lang__image').classList.replace('lang-ru', classLangTop.classList[1]);
            classLangTop.classList.replace(classLangTop.classList[1], 'lang-ru');

            return;
        }
        if (e.target.closest('.lang__image.lang-cp')) {
            const classLangTop = document.querySelector('.lang__top .lang__image');

            e.target.closest('.lang__image').classList.replace('lang-cp', classLangTop.classList[1]);
            classLangTop.classList.replace(classLangTop.classList[1], 'lang-cp');
            return;
        }
        if (e.target.closest('.lang__image.lang-en')) {
            const classLangTop = document.querySelector('.lang__top .lang__image');

            e.target.closest('.lang__image').classList.replace('lang-en', classLangTop.classList[1]);
            classLangTop.classList.replace(classLangTop.classList[1], 'lang-en');
            return;
        }
    }

    langDrop.addEventListener('click', langStyle);
}




//=====================
//sliders

$('.banners__slider').slick({
    infinite: true,
    arrows: true,

    slidesToScroll: 1,
    variableWidth: true,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,

    prevArrow:
        `<div class="slick-arrow_prev">
        <img src="./images/icons/arrow-prev.svg" alt="">
    </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
        <img src="./images/icons/arrow-next.svg" alt="">
    </div>`,
});

$('.popular-products__slider').slick({
    infinite: true,
    slidesToShow: 5,
    slidesToScroll: 3,
    prevArrow:
        `<div class="slick-arrow_prev">
            <img src="./images/icons/arrow-prev.svg" alt="">
        </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
            <img src="./images/icons/arrow-next.svg" alt="">
        </div>`,
    responsive: [
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 4,
                slidesToScroll: 2,
            }
        },
        {
            breakpoint: 768,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 600,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 400,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        }
    ]
});

$('.reviews__slider').slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 2,
    focusOnSelect: true,
    adaptiveHeight: true,
    variableWidth: true,
    prevArrow:
        `<div class="slick-arrow_prev">
            <img src="./images/icons/arrow-prev.svg" alt="">
        </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
            <img src="./images/icons/arrow-next.svg" alt="">
        </div>`,
    responsive: [
        {
            breakpoint: 768,
            settings: {
                slidesToScroll: 1,
            }
        }
    ]
});

const reviewSliders = document.querySelectorAll('.reviews__slider');

for (let index = 0; index < reviewSliders.length; index++) {
    const reviewSlider = reviewSliders[index];

    const reviewOpen = (e) => {

        if (e.target.closest('.slick-slide')) {
            e.target.closest('.reviews__slider').classList.add('open');
            e.target.closest('.slick-slide').classList.add('open');

            $('.reviews__slider').slick('slickSetOption', {
                swipe: false,
                arrows: false,
            });

            const index = e.target.closest('.slick-slide').getAttribute('data-slick-index');
        }

        if (e.target.closest('.card-review__close')) {
            e.target.closest('.card-review__close').closest('.slick-slide').classList.remove('open');
            e.target.closest('.reviews__slider').classList.remove('open');
            $('.reviews__slider').slick('slickSetOption', {
                swipe: true,
                arrows: true,
            });
        }
    }

    reviewSlider.addEventListener('click', reviewOpen);
}

$('.shop-category__slider').slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 2,
    prevArrow:
        `<div class="slick-arrow_prev">
            <img src="./images/icons/arrow-prev.svg" alt="">
        </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
            <img src="./images/icons/arrow-next.svg" alt="">
        </div>`,
    responsive: [
        {
            breakpoint: 1000,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 680,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 500,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
                prevArrow:
                    `<div class="slick-arrow_prev">
                        <img src="./images/icons/arrow-wh-prev.svg" alt="">
                    </div>`,
                nextArrow:
                    `<div class=" slick-arrow_next">
                        <img src="./images/icons/arrow-wh-next.svg" alt="">
                    </div>`,
            }
        },
        {
            breakpoint: 380,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                prevArrow:
                    `<div class="slick-arrow_prev">
                        <img src="./images/icons/arrow-wh-prev.svg" alt="">
                    </div>`,
                nextArrow:
                    `<div class=" slick-arrow_next">
                        <img src="./images/icons/arrow-wh-next.svg" alt="">
                    </div>`,
            }
        }
    ]
});

$('.discover__slider').slick({
    arrows: false,
    slidesToShow: 3,
    slidesToScroll: 1,

    responsive: [
        {
            breakpoint: 1000,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 580,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        },
    ]
});

$('.preview-images').slick({
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: '.images-product__nav',

    // responsive: [
    //     {
    //         breakpoint: 1000,
    //         settings: {
    //             slidesToShow: 2,
    //             slidesToScroll: 1,
    //         }
    //     },
    //     {
    //         breakpoint: 580,
    //         settings: {
    //             slidesToShow: 1,
    //             slidesToScroll: 1,
    //         }
    //     },
    // ]
});
$('.images-product__nav').slick({
    arrows: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    focusOnSelect: true,
    prevArrow:
        `<div class="slick-arrow_prev">
        <img src="./images/icons/arrow-prev.svg" alt="">
    </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
        <img src="./images/icons/arrow-next.svg" alt="">
    </div>`,
    asNavFor: '.preview-images',

    responsive: [
        {
            breakpoint: 1000,
            settings: {
                arrows: false,
            }
        },
    ]
});

$('.works__slider').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    variableWidth: true,
    prevArrow:
        `<div class="slick-arrow_prev">
            <img src="./images/icons/arrow-prev.svg" alt="">
        </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
            <img src="./images/icons/arrow-next.svg" alt="">
        </div>`,
    responsive: [
        {
            breakpoint: 760,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                variableWidth: false,
            }
        }
    ]
});

$('.academy-works__slider').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    prevArrow:
        `<div class="slick-arrow_prev">
            <img src="./images/icons/arrow-prev.svg" alt="">
        </div>`,
    nextArrow:
        `<div class=" slick-arrow_next">
            <img src="./images/icons/arrow-next.svg" alt="">
        </div>`,
    responsive: [
        {
            breakpoint: 1150,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
            }
        },
        {
            breakpoint: 650,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
            }
        }
    ]
});

//=====================
//dropdown select

const dropdownSelect = document.querySelectorAll('.dropdown-select');

if (dropdownSelect.length > 0) {
    dropdownSelect.forEach(select => {
        const selectTop = select.querySelector('.select-top');
        const selectDrop = select.querySelector('.drop-select');

        const checkWindowClick = (e) => {
            if (!e.target.closest('.dropdown-select')) {
                selectClose();
            }
        }

        const selectClose = (e) => {
            select.classList.remove('open');
        }

        const selectToggle = (e) => {
            select.classList.toggle('open');
        }

        selectTop.addEventListener('click', selectToggle);
        window.addEventListener('click', checkWindowClick);

        const selectDropHadler = (e) => {
            const dropItem = e.target.closest('.drop-select__item');
            if (dropItem) {
                const dropText = dropItem.querySelector('.drop-select__text').textContent;
                if (dropText != null) {
                    selectTop.querySelector('.select__selected').innerHTML = dropText;
                }
            }
        }

        selectDrop.addEventListener('click', selectDropHadler);
    });
}

//=================
//SlideToggle
let _slideUp = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        target.style.transitionProperty = 'height, margin, padding';
        target.style.transitionDuration = duration + 'ms';
        target.style.height = target.offsetHeight + 'px';
        target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        window.setTimeout(() => {
            target.hidden = true;
            target.style.removeProperty('height');
            target.style.removeProperty('padding-top');
            target.style.removeProperty('padding-bottom');
            target.style.removeProperty('margin-top');
            target.style.removeProperty('margin-bottom');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}
let _slideDown = (target, duration = 500) => {
    if (!target.classList.contains('_slide')) {
        target.classList.add('_slide');
        if (target.hidden) {
            target.hidden = false;
        }
        let height = target.offsetHeight;
        target.style.overflow = 'hidden';
        target.style.height = 0;
        target.style.paddingTop = 0;
        target.style.paddingBottom = 0;
        target.style.marginTop = 0;
        target.style.marginBottom = 0;
        target.offsetHeight;
        target.style.transitionProperty = "height, margin, padding";
        target.style.transitionDuration = duration + 'ms';
        target.style.height = height + 'px';
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
        window.setTimeout(() => {
            target.style.removeProperty('height');
            target.style.removeProperty('overflow');
            target.style.removeProperty('transition-duration');
            target.style.removeProperty('transition-property');
            target.classList.remove('_slide');
        }, duration);
    }
}
let _slideToggle = (target, duration = 500) => {
    if (target.hidden) {
        return _slideDown(target, duration);
    } else {
        return _slideUp(target, duration);
    }
}

//=====================
// SPOLLERS
const spollersArray = document.querySelectorAll('[data-spollers]');
if (spollersArray.length > 0) {
    // Получение обычных слойлеров
    const spollersRegular = Array.from(spollersArray).filter(function (item, index, self) {
        return !item.dataset.spollers.split(",")[0];
    });
    // Инициализация обычных слойлеров
    if (spollersRegular.length > 0) {
        initSpollers(spollersRegular);
    }

    // Получение слойлеров с медиа запросами
    const spollersMedia = Array.from(spollersArray).filter(function (item, index, self) {
        return item.dataset.spollers.split(",")[0];
    });

    // Инициализация слойлеров с медиа запросами
    if (spollersMedia.length > 0) {
        const breakpointsArray = [];
        spollersMedia.forEach(item => {
            const params = item.dataset.spollers;
            const breakpoint = {};
            const paramsArray = params.split(",");
            breakpoint.value = paramsArray[0];
            breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max";
            breakpoint.item = item;
            breakpointsArray.push(breakpoint);
        });

        // Получаем уникальные брейкпоинты
        let mediaQueries = breakpointsArray.map(function (item) {
            return '(' + item.type + "-width: " + item.value + "px)," + item.value + ',' + item.type;
        });
        mediaQueries = mediaQueries.filter(function (item, index, self) {
            return self.indexOf(item) === index;
        });

        // Работаем с каждым брейкпоинтом
        mediaQueries.forEach(breakpoint => {
            const paramsArray = breakpoint.split(",");
            const mediaBreakpoint = paramsArray[1];
            const mediaType = paramsArray[2];
            const matchMedia = window.matchMedia(paramsArray[0]);

            // Объекты с нужными условиями
            const spollersArray = breakpointsArray.filter(function (item) {
                if (item.value === mediaBreakpoint && item.type === mediaType) {
                    return true;
                }
            });
            // Событие
            matchMedia.addListener(function () {
                initSpollers(spollersArray, matchMedia);
            });
            initSpollers(spollersArray, matchMedia);
        });
    }
    // Инициализация
    function initSpollers(spollersArray, matchMedia = false) {
        spollersArray.forEach(spollersBlock => {
            spollersBlock = matchMedia ? spollersBlock.item : spollersBlock;
            if (matchMedia.matches || !matchMedia) {
                spollersBlock.classList.add('_init');
                initSpollerBody(spollersBlock);
                spollersBlock.addEventListener("click", setSpollerAction);
            } else {
                spollersBlock.classList.remove('_init');
                initSpollerBody(spollersBlock, false);
                spollersBlock.removeEventListener("click", setSpollerAction);
            }
        });
    }
    // Работа с контентом
    function initSpollerBody(spollersBlock, hideSpollerBody = true) {
        const spollerTitles = spollersBlock.querySelectorAll('[data-spoller]');
        if (spollerTitles.length > 0) {
            spollerTitles.forEach(spollerTitle => {
                if (hideSpollerBody) {
                    spollerTitle.removeAttribute('tabindex');
                    if (!spollerTitle.classList.contains('_active')) {
                        spollerTitle.nextElementSibling.hidden = true;
                    }
                } else {
                    spollerTitle.setAttribute('tabindex', '-1');
                    spollerTitle.nextElementSibling.hidden = false;
                }
            });
        }
    }
    function setSpollerAction(e) {
        const el = e.target;
        if (el.hasAttribute('data-spoller') || el.closest('[data-spoller]')) {
            const spollerTitle = el.hasAttribute('data-spoller') ? el : el.closest('[data-spoller]');
            const spollersBlock = spollerTitle.closest('[data-spollers]');
            const oneSpoller = spollersBlock.hasAttribute('data-one-spoller') ? true : false;
            if (!spollersBlock.querySelectorAll('._slide').length) {
                if (oneSpoller && !spollerTitle.classList.contains('_active')) {
                    hideSpollersBody(spollersBlock);
                }
                spollerTitle.classList.toggle('_active');
                _slideToggle(spollerTitle.nextElementSibling, 500);
            }
            e.preventDefault();
        }
    }
    function hideSpollersBody(spollersBlock) {
        const spollerActiveTitle = spollersBlock.querySelector('[data-spoller]._active');
        if (spollerActiveTitle) {
            spollerActiveTitle.classList.remove('_active');
            _slideUp(spollerActiveTitle.nextElementSibling, 500);
        }
    }
}

//QUANTITY
let quantityButtons = document.querySelectorAll('.quantity__button');
if (quantityButtons.length > 0) {
    for (let index = 0; index < quantityButtons.length; index++) {
        const quantityButton = quantityButtons[index];
        quantityButton.addEventListener("click", function (e) {
            let value = parseInt(quantityButton.closest('.quantity').querySelector('input').value);
            if (quantityButton.classList.contains('quantity__button_plus')) {
                value++;
            } else {
                value = value - 1;
                if (value < 1) {
                    value = 1;
                }
            }
            quantityButton.closest('.quantity').querySelector('input').value = value;
        });
    }
}

//=================
//Tabs
let tabs = document.querySelectorAll("._tabs");
for (let index = 0; index < tabs.length; index++) {
    let tab = tabs[index];
    let tabs_items = tab.querySelectorAll("._tabs-item");
    let tabs_blocks = tab.querySelectorAll("._tabs-block");
    for (let index = 0; index < tabs_items.length; index++) {
        let tabs_item = tabs_items[index];
        tabs_item.addEventListener("click", function (e) {
            for (let index = 0; index < tabs_items.length; index++) {
                let tabs_item = tabs_items[index];
                tabs_item.classList.remove('_active');
                tabs_blocks[index].classList.remove('_active');
            }
            tabs_item.classList.add('_active');
            tabs_blocks[index].classList.add('_active');
            e.preventDefault();
        });
    }
}

//=================
//Select

let selects = document.getElementsByTagName('select');

if (selects.length > 0) {
    selects_init();
}
function selects_init() {
    for (let index = 0; index < selects.length; index++) {
        const select = selects[index];
        select_init(select);
    }
    //select_callback();
    document.addEventListener('click', function (e) {
        selects_close(e);
    });
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Escape') {
            selects_close(e);
        }
    });
}
function selects_close(e) {
    const selects = document.querySelectorAll('.select');
    if (!e.target.closest('.select') && !e.target.classList.contains('_option')) {
        for (let index = 0; index < selects.length; index++) {
            const select = selects[index];
            const select_body_options = select.querySelector('.select__options');
            select.classList.remove('_active');
            _slideUp(select_body_options, 100);
        }
    }
}
function select_init(select) {
    const select_parent = select.parentElement;
    const select_modifikator = select.getAttribute('class');
    const select_selected_option = select.querySelector('option:checked');
    select.setAttribute('data-default', select_selected_option.value);
    select.style.display = 'none';

    select_parent.insertAdjacentHTML('beforeend', '<div class="select select_' + select_modifikator + '"></div>');

    let new_select = select.parentElement.querySelector('.select');
    new_select.appendChild(select);
    select_item(select);
}
function select_item(select) {
    const select_parent = select.parentElement;
    const select_items = select_parent.querySelector('.select__item');
    const select_options = select.querySelectorAll('option');
    const select_selected_option = select.querySelector('option:checked');
    const select_selected_text = select_selected_option.text;
    const select_type = select.getAttribute('data-type');

    if (select_items) {
        select_items.remove();
    }

    let select_type_content = '';
    if (select_type == 'input') {
        select_type_content = '<div class="select__value icon-select-arrow"><input autocomplete="off" type="text" name="form[]" value="' + select_selected_text + '" data-error="Ошибка" data-value="' + select_selected_text + '" class="select__input"></div>';
    } else {
        select_type_content = '<div class="select__value icon-select-arrow"><span>' + select_selected_text + '</span></div>';
    }

    select_parent.insertAdjacentHTML('beforeend',
        '<div class="select__item">' +
        '<div class="select__title">' + select_type_content + '</div>' +
        '<div hidden class="select__options">' + select_get_options(select_options) + '</div>' +
        '</div></div>');

    select_actions(select, select_parent);
}
function select_actions(original, select) {
    const select_item = select.querySelector('.select__item');
    const selectTitle = select.querySelector('.select__title');
    const select_body_options = select.querySelector('.select__options');
    const select_options = select.querySelectorAll('.select__option');
    const select_type = original.getAttribute('data-type');
    const select_input = select.querySelector('.select__input');

    selectTitle.addEventListener('click', function (e) {
        selectItemActions();
    });

    function selectMultiItems() {
        let selectedOptions = select.querySelectorAll('.select__option');
        let originalOptions = original.querySelectorAll('option');
        let selectedOptionsText = [];
        for (let index = 0; index < selectedOptions.length; index++) {
            const selectedOption = selectedOptions[index];
            originalOptions[index].removeAttribute('selected');
            if (selectedOption.classList.contains('_selected')) {
                const selectOptionText = selectedOption.innerHTML;
                selectedOptionsText.push(selectOptionText);
                originalOptions[index].setAttribute('selected', 'selected');
            }
        }
        select.querySelector('.select__value').innerHTML = '<span>' + selectedOptionsText + '</span>';
    }
    function selectItemActions(type) {
        if (!type) {
            let selects = document.querySelectorAll('.select');
            for (let index = 0; index < selects.length; index++) {
                const select = selects[index];
                const select_body_options = select.querySelector('.select__options');
                if (select != select_item.closest('.select')) {
                    select.classList.remove('_active');
                    _slideUp(select_body_options, 100);
                }
            }
            _slideToggle(select_body_options, 100);
            select.classList.toggle('_active');
        }
    }
    for (let index = 0; index < select_options.length; index++) {
        const select_option = select_options[index];
        const select_option_value = select_option.getAttribute('data-value');
        const select_option_text = select_option.innerHTML;

        if (select_type == 'input') {
            select_input.addEventListener('keyup', select_search);
        } else {
            if (select_option.getAttribute('data-value') == original.value && !original.hasAttribute('multiple')) {
                select_option.style.display = 'none';
            }
        }
        select_option.addEventListener('click', function () {
            for (let index = 0; index < select_options.length; index++) {
                const el = select_options[index];
                el.style.display = 'block';
            }
            if (select_type == 'input') {
                select_input.value = select_option_text;
                original.value = select_option_value;
            } else {
                if (original.hasAttribute('multiple')) {
                    select_option.classList.toggle('_selected');
                    selectMultiItems();
                } else {
                    select.querySelector('.select__value').innerHTML = '<span>' + select_option_text + '</span>';
                    original.value = select_option_value;
                    select_option.style.display = 'none';
                }
            }
            let type;
            if (original.hasAttribute('multiple')) {
                type = 'multiple';
            }
            selectItemActions(type);
        });
    }
}
function select_get_options(select_options) {
    if (select_options) {
        let select_options_content = '';
        for (let index = 0; index < select_options.length; index++) {
            const select_option = select_options[index];
            const select_option_value = select_option.value;
            if (select_option_value != '') {
                const select_option_text = select_option.innerHTML;
                select_options_content = select_options_content + '<div data-value="' + select_option_value + '" class="select__option">' + select_option_text + '</div>';
            }
        }
        return select_options_content;
    }
}
function select_search(e) {
    let select_block = e.target.closest('.select ').querySelector('.select__options');
    let select_options = e.target.closest('.select ').querySelectorAll('.select__option');
    let select_search_text = e.target.value.toUpperCase();

    for (let i = 0; i < select_options.length; i++) {
        let select_option = select_options[i];
        let select_txt_value = select_option.textContent || select_option.innerText;
        if (select_txt_value.toUpperCase().indexOf(select_search_text) > -1) {
            select_option.style.display = "";
        } else {
            select_option.style.display = "none";
        }
    }
}
function selects_update_all() {
    let selects = document.querySelectorAll('select');
    if (selects) {
        for (let index = 0; index < selects.length; index++) {
            const select = selects[index];
            select_item(select);
        }
    }
}

const passwordEyes = document.querySelectorAll('.password-eye');

if (passwordEyes.length > 0) {

    passwordEyes.forEach(passwordEye => {
        const passInput = passwordEye.parentElement.querySelector('input');

        const passwordToggle = (e) => {
            if (passInput.getAttribute('type') === 'password') {
                passInput.setAttribute('type', 'text');
                passwordEye.classList.add('clicked');
                return;
            }

            passInput.setAttribute('type', 'password');
            passwordEye.classList.remove('clicked');
        }

        passwordEye.addEventListener('click', passwordToggle);
    });
}

//=================
//Popups
let popup_link = document.querySelectorAll('._popup-link');
let popups = document.querySelectorAll('.popup');
for (let index = 0; index < popup_link.length; index++) {
    const el = popup_link[index];
    el.addEventListener('click', function (e) {
        if (unlock) {
            let item = el.getAttribute('href').replace('#', '');
            let video = el.getAttribute('data-video');
            popup_open(item, video);
        }
        e.preventDefault();
    })
}
for (let index = 0; index < popups.length; index++) {
    const popup = popups[index];
    popup.addEventListener("click", function (e) {
        if (!e.target.closest('.popup__body')) {
            popup_close(e.target.closest('.popup'));
        }
    });
}
function popup_open(item, video = '') {
    let activePopup = document.querySelectorAll('.popup._active');
    if (activePopup.length > 0) {
        popup_close('', false);
    }
    let curent_popup = document.querySelector('.popup_' + item);
    if (curent_popup && unlock) {
        if (video != '' && video != null) {
            let popup_video = document.querySelector('.popup_video');
            popup_video.querySelector('.popup__video').innerHTML = '<iframe src="https://www.youtube.com/embed/' + video + '?autoplay=1"  allow="autoplay; encrypted-media" allowfullscreen></iframe>';
        }
        if (!document.querySelector('.menu__body._active')) {
            body_lock_add(500);
        }
        curent_popup.classList.add('_active');
        history.pushState('', '', '#' + item);
    }
}
function popup_close(item, bodyUnlock = true) {
    if (unlock) {
        if (!item) {
            for (let index = 0; index < popups.length; index++) {
                const popup = popups[index];
                let video = popup.querySelector('.popup__video');
                if (video) {
                    video.innerHTML = '';
                }
                popup.classList.remove('_active');
            }
        } else {
            let video = item.querySelector('.popup__video');
            if (video) {
                video.innerHTML = '';
            }
            item.classList.remove('_active');
        }
        if (!document.querySelector('.menu__body._active') && bodyUnlock) {
            body_lock_remove(500);
        }
        history.pushState('', '', window.location.href.split('#')[0]);
    }
}
let popup_close_icon = document.querySelectorAll('.popup__close,._popup-close');
if (popup_close_icon) {
    for (let index = 0; index < popup_close_icon.length; index++) {
        const el = popup_close_icon[index];
        el.addEventListener('click', function () {
            popup_close(el.closest('.popup'));
        })
    }
}
document.addEventListener('keydown', function (e) {
    if (e.code === 'Escape') {
        popup_close();
    }
});


