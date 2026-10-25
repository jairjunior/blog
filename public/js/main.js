/****************************************************************************** 
/ Função para colapsar/mostrar o menu superior do site
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
/ Função para destacar a categoria selecionada
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
    }

});