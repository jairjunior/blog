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