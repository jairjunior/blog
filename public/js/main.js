/****************************************************************************** 
/ Função para mostrar/colapsar o menu superior do site.
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
/ Função para capturar os clicks nos botões de "Criar Conta" e "Entrar"
/ Esses botões estão dentro do menu principal que aparece em dispositivos móveis
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const authButtons = document.querySelectorAll('#buttonMenuRegister, #buttonMenuLogin');
    authButtons.forEach( button => {
        button.addEventListener('click', () => {
            const targetUrl = button.getAttribute('data-redirect');
            const currentUrl = window.location.href;
            window.location.href = `${targetUrl}?redirectTo=${encodeURIComponent(currentUrl)}`;
        });
    });
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


/****************************************************************************** 
/ Função para abertura/fechamento do dropdown ao clicar na foto.
/
/ Ao clicar fora ou ao pressionar ESC
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('profileToggleBtn');
    const dropdown = document.getElementById('profileDropdown');

    if (toggleBtn && dropdown) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('active');
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
    const searchInput = document.getElementById('searchInput');

    if (topSearchButton && searchModal) {
        // Abrir modal ao clicar no ícone da lupa
        topSearchButton.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            searchModal.setAttribute('aria-hidden', false);
            document.body.style.overflow = 'hidden'; // Impede o scroll da página de fundo
            setTimeout(() => {
                if (searchInput) searchInput.focus(); // Foca automaticamente no input
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