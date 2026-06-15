import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

new Swiper('.gallery__swiper', {
	modules: [Navigation],
	slidesPerView: 'auto',
	spaceBetween: 24,
	centeredSlides: true,
	loop: true,
	speed: 500,
	navigation: {
		prevEl: '.gallery__nav-btn--prev',
		nextEl: '.gallery__nav-btn--next'
	}
});

// Лайтбокс: клик по фото → увеличение.
// В Swiper loop слайды клонируются/переставляются в DOM, поэтому список строим
// по реальному индексу слайда (data-swiper-slide-index) — иначе открывалась не та картинка.
const gallerySwiper = document.querySelector('.gallery__swiper');
if (gallerySwiper) {
	const byIndex = [];
	gallerySwiper.querySelectorAll('.swiper-slide').forEach(slide => {
		const attr = slide.getAttribute('data-swiper-slide-index');
		if (attr === null) return;
		const realIndex = parseInt(attr, 10);
		if (byIndex[realIndex]) return; // пропускаем клоны с тем же индексом
		const link = slide.querySelector('.gallery__card-link');
		if (link) byIndex[realIndex] = link.getAttribute('href');
	});
	const items = byIndex.filter(Boolean).map(src => ({ src, type: 'image' }));

	gallerySwiper.addEventListener('click', event => {
		const link = event.target.closest('.gallery__card-link');
		if (!link) return;
		event.preventDefault();
		const slide = link.closest('.swiper-slide');
		const realIndex = parseInt(slide?.getAttribute('data-swiper-slide-index') ?? '0', 10);
		Fancybox.show(items, { startIndex: Number.isNaN(realIndex) ? 0 : realIndex });
	});
}
