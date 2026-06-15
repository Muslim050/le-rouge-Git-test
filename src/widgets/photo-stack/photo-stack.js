import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

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

// Лайтбокс (клик по фото → увеличение) убран по требованию: в «Интерьерах»
// картинка не открывается на увеличение. Листание — только стрелками/свайпом.
