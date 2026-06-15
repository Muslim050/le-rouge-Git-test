import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

// «Интерьеры»:
// - десктоп/1440 (≥769) — вертикальная стопка фото с налистыванием по скроллу
//   (CSS position:sticky, см. photo-stack.scss). Swiper тут НЕ нужен.
// - мобайл (≤768) — горизонтальный слайдер как раньше.
// Поэтому Swiper инициализируем ТОЛЬКО на мобиле и уничтожаем на десктопе
// (иначе его transform на .swiper-wrapper ломает sticky-стопку).
const photoStackMq = window.matchMedia('(max-width: 768px)');
let photoStackSlider = null;

const syncPhotoStackSlider = () => {
	if (photoStackMq.matches) {
		if (!photoStackSlider) {
			photoStackSlider = new Swiper('.photo-stack__swiper', {
				modules: [Navigation],
				slidesPerView: 'auto',
				spaceBetween: 24,
				centeredSlides: true,
				loop: true,
				speed: 500,
				navigation: {
					prevEl: '.photo-stack__nav-btn--prev',
					nextEl: '.photo-stack__nav-btn--next'
				}
			});
		}
	} else if (photoStackSlider) {
		photoStackSlider.destroy(true, true); // чистим inline-стили/классы
		photoStackSlider = null;
	}
};

syncPhotoStackSlider();
photoStackMq.addEventListener('change', syncPhotoStackSlider);

// Лайтбокс: клик по фото → увеличение.
// В Swiper loop слайды клонируются/переставляются в DOM, поэтому список строим
// по реальному индексу слайда (data-swiper-slide-index) — иначе открывалась не та картинка.
const photoStackSwiper = document.querySelector('.photo-stack__swiper');
if (photoStackSwiper) {
	const byIndex = [];
	photoStackSwiper.querySelectorAll('.swiper-slide').forEach(slide => {
		const attr = slide.getAttribute('data-swiper-slide-index');
		if (attr === null) return;
		const realIndex = parseInt(attr, 10);
		if (byIndex[realIndex]) return; // пропускаем клоны с тем же индексом
		const link = slide.querySelector('.photo-stack__card-link');
		if (link) byIndex[realIndex] = link.getAttribute('href');
	});
	const items = byIndex.filter(Boolean).map(src => ({ src, type: 'image' }));

	photoStackSwiper.addEventListener('click', event => {
		const link = event.target.closest('.photo-stack__card-link');
		if (!link) return;
		event.preventDefault();
		const slide = link.closest('.swiper-slide');
		const realIndex = parseInt(slide?.getAttribute('data-swiper-slide-index') ?? '0', 10);
		Fancybox.show(items, { startIndex: Number.isNaN(realIndex) ? 0 : realIndex });
	});
}
