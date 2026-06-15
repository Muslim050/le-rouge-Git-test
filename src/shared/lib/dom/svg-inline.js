export const svgInline = (selector = 'img.svg-inline') => {
    const images = document.querySelectorAll(selector);
    const promises = Array.from(images).map((img) => {
        const { id, className, src } = img;
        return fetch(src)
            .then((res) => res.text())
            .then((text) => {
                const svg = new DOMParser()
                    .parseFromString(text, 'image/svg+xml')
                    .querySelector('svg');
                if (!svg) return;
                if (id) svg.setAttribute('id', id);
                if (className) svg.setAttribute('class', `${className} replaced-svg`);
                svg.removeAttribute('xmlns:a');

                // Копируем все data-* атрибуты с img на svg
                Array.from(img.attributes).forEach((attr) => {
                    if (attr.name.startsWith('data-')) {
                        svg.setAttribute(attr.name, attr.value);
                    }
                });

                img.replaceWith(svg);
            })
            .catch(() => {});
    });

    return Promise.all(promises);
};
