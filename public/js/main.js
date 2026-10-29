/****************************************************************************** 
/ Função para colapsar/mostrar o menu superior do site.
******************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
    const headerTop = document.querySelector(".header-top");
    const menuToggle = document.querySelector(".menu-toggle");

    if (menuToggle && headerTop) {
        menuToggle.addEventListener("click", () => {
            // Alterna a classe 'menu-open' no container principal do header
            headerTop.classList.toggle("menu-open");
            
            // Atualiza o atributo de acessibilidade
            const isExpanded = headerTop.classList.contains("menu-open");
            menuToggle.setAttribute("aria-expanded", isExpanded);
        });

        // Opcional: Fecha o menu automaticamente ao clicar em qualquer link dele (bom para mobile)
        const navLinks = document.querySelectorAll(".top-navbar a");
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                headerTop.classList.remove("menu-open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
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
/
******************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    const searchLink = document.getElementById('searchLink');
    const searchModal = document.getElementById('searchModal');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchLink && searchModal) {
        // Abrir modal ao clicar na lupa
        searchLink.addEventListener('click', (e) => {
            e.preventDefault();
            searchModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede o scroll da página de fundo
            setTimeout(() => {
                if (searchInput) searchInput.focus(); // Foca automaticamente no input
            }, 100);
        });

        // Fechar modal pelo botão "X"
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', () => {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Fechar modal ao clicar fora da caixa central (no overlay translúcido)
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Fechar modal pressionando a tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                searchModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});