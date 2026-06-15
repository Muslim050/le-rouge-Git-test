import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

new Swiper('.poster__swiper', {
	modules: [Navigation],
	slidesPerView: 'auto',
	spaceBetween: -69, // 548 (слот) + (-69) = 479 → центры боковых карточек на ±479 как в Figma
	centeredSlides: true,
	loop: true, // карточки с обеих сторон (как в Figma), не пусто слева
	speed: 600,
	grabCursor: true,
	watchSlidesProgress: true,
	slideToClickedSlide: true,
	navigation: {
		prevEl: '.poster__nav-btn--prev',
		nextEl: '.poster__nav-btn--next'
	},
	breakpoints: {
		768: { spaceBetween: -69 },
		0: { spaceBetween: 12 }
	}
});
