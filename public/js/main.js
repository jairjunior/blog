/****************************************************************************** 
/ Função para mostrar/colapsar o menu lateral do site (mobile).
******************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    const headerTop = document.querySelector(".header-top");
    const burgerButton = document.querySelector(".hamburger-btn");

    if (burgerButton && headerTop) {
        const closeMenu = () => {
            headerTop.classList.remove("menu-open");
            burgerButton.setAttribute("aria-expanded", "false");
        };
        // Alterna o menu ao clicar no botão hambúrguer
        burgerButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const isOpen = headerTop.classList.toggle("menu-open");
            burgerButton.setAttribute("aria-expanded", isOpen);
        });
        // Fechar ao clicar fora do menu
        document.addEventListener("click", (event) => {
            const isMenuOpen = headerTop.classList.contains("menu-open");
            if (isMenuOpen && !headerTop.contains(event.target) && !burgerButton.contains(event.target)) {
                closeMenu();
            }
        });
        // Fechar ao apertar a tecla ESC
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && headerTop.classList.contains("menu-open")) {
                closeMenu();
                burgerButton.focus();
            }
        });
    }
});


/****************************************************************************** 
/ Função para abrir/fechar o modal de busca.
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const topSearchButton = document.getElementById('topSearchButton');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchModalInput = document.getElementById('searchModalInput');

    if (topSearchButton && searchModal) {
        // Abrir modal ao clicar no ícone da lupa
        topSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            searchModal.setAttribute('aria-hidden', false);
            document.body.style.overflow = 'hidden'; // Impede o scroll da página de fundo
            setTimeout(() => {
                if (searchModalInput) searchModalInput.focus(); // Foca automaticamente no input
            }, 100);
        });
        // Função para fechar o modal
        const closeSearchModal = () => {
            if (topSearchButton) {
                topSearchButton.focus();
            }
            searchModal.classList.remove('active');
            searchModal.setAttribute('aria-hidden', true);
            document.body.style.overflow = '';
        };
        // Evento click no botão "X"
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', closeSearchModal);
        }
        // Evento click fora do modal
        searchModal.addEventListener('click', (event) => {
            if (event.target === searchModal) {
                closeSearchModal();
            }
        });
        // Evento tecla ESC
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && searchModal.classList.contains('active')) {
                closeSearchModal();
            }
        });
    }
});


/****************************************************************************** 
/ Função para abertura/fechamento do Dropdown Menu ao clicar na foto.
/ Ao clicar fora ou ao pressionar ESC
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('profileToggleBtn');
    const dropdownMenu = document.getElementById('profileDropdown');

    if (toggleBtn && dropdownMenu) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdownMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdownMenu.classList.remove('active');
            }
        });
    }
});


/****************************************************************************** 
/ Função para destacar a categoria selecionada.
******************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    const segments = currentPath.split('/');
    const targetIndex = segments.indexOf('posts');
    if (targetIndex !== -1) {
        var urlCategory;
        if (segments[targetIndex + 1]) {
            urlCategory = '/' + segments[targetIndex + 1];
        } else {
            urlCategory = '';
        }
        const navLinks = document.querySelectorAll(".category-navbar li a");
        navLinks.forEach(link => {
            const linkHref = link.getAttribute("href");
            if (linkHref === `/posts${urlCategory}` ) {
                link.closest(".category-navbar li").classList.add("active");
            }
        });
    } else {
        const homeLink = document.querySelector('.category-navbar li a[href="/"]');
        homeLink.closest(".category-navbar li").classList.add("active");
    }
});