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
        const navLinks = document.querySelectorAll(".category-nav li a");
        navLinks.forEach(link => {
            const linkHref = link.getAttribute("href");
            if (linkHref === `/posts${urlCategory}` ) {
                link.closest(".category-nav li").classList.add("active");
            }
        });
    }

});

