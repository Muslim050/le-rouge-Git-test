import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

// Секция «Девушки» (главная):
// - свайп/стрелки листают фото девушек;
// - под фото одна инфо-карточка (имя, мета, шкалы трейтов) — JS обновляет её
//   при смене активного слайда.
//
// ВАЖНО (для бэкенда): данные девушек НЕ зашиты в этот файл. Источник истины —
// РАЗМЕТКА: каждый слайд .swiper-slide несёт поля девушки в data-* атрибутах
// (data-name/age/params/zodiac/stats[JSON]). JS только читает их из DOM.
// Бэкенд рендерит список слайдов из Bitrix — скрипт подхватывает автоматически.

const initGirlsSelect = () => {
	const root = document.querySelector('.girls-select');
	if (!root) return;

	const swiperEl = root.querySelector('.girls-select__swiper');
	const slides = root.querySelectorAll('.girls-select__swiper .swiper-slide');
	const info = root.querySelector('.girls-select__info');
	if (!swiperEl || !slides.length || !info) return;

	const nameEl = info.querySelector('.girls-select__name');
	const metaItems = info.querySelectorAll('.girls-select__meta-item');
	const statEls = info.querySelectorAll('.girls-select__stat');

	const parseJSON = (str, fallback) => {
		try { return JSON.parse(str); } catch (err) { return fallback; }
	};

	// === Данные читаем ИЗ РАЗМЕТКИ (data-* на слайдах) ===
	const POOL = Array.from(slides).map(s => ({
		name: s.dataset.name || '',
		age: s.dataset.age || '',
		params: s.dataset.params || '',
		zodiac: s.dataset.zodiac || '',
		stats: parseJSON(s.dataset.stats, [])
	}));

	const renderInfo = index => {
		const g = POOL[((index % POOL.length) + POOL.length) % POOL.length];
		if (!g) return;

		// имя (иконка зодиака — соседний элемент, её не трогаем)
		if (nameEl) nameEl.textContent = g.name;

		// мета: возраст / параметры / знак
		if (metaItems.length >= 3) {
			metaItems[0].textContent = g.age;
			metaItems[1].textContent = g.params;
			metaItems[2].textContent = g.zodiac;
		}

		// шкалы трейтов
		statEls.forEach((stat, i) => {
			const s = g.stats[i];
			if (!s) return;
			const label = stat.querySelector('.girls-select__stat-label');
			const value = stat.querySelector('.girls-select__stat-value');
			const fill = stat.querySelector('.girls-select__stat-fill');
			if (label) label.textContent = s.label;
			if (value) value.textContent = `${s.value}%`;
			if (fill) fill.style.width = `${s.value}%`;
		});
	};

	const swiper = new Swiper(swiperEl, {
		modules: [Navigation],
		slidesPerView: 'auto',
		spaceBetween: 180,
		centeredSlides: true,
		// rewind, не loop: Swiper 11 не умеет зациклить всего 3 демо-слайда (нужно
		// ≥6 — клонов не создаёт, ломает позиционирование). На бою бэкенд отдаёт много
		// девушек → соседние фото подглядывают с обеих сторон как в Figma и без loop.
		rewind: true,
		speed: 700,
		grabCursor: true,
		watchSlidesProgress: true,
		slideToClickedSlide: true,
		navigation: {
			prevEl: '.girls-select__nav-btn--prev',
			nextEl: '.girls-select__nav-btn--next'
		},
		breakpoints: {
			768: { spaceBetween: 180 },
			0: { spaceBetween: 24 }
		},
		on: {
			// slideChange срабатывает надёжно (в отличие от ...TransitionEnd):
			// обновляем поля карточки и проигрываем одноразовый фейд через WAAPI,
			// чтобы видимость карточки не зависела от события окончания анимации.
			slideChange() {
				renderInfo(this.realIndex);
				if (typeof info.animate === 'function') {
					info.animate(
						[
							{ opacity: 0, transform: 'translateY(8px)' },
							{ opacity: 1, transform: 'none' }
						],
						{ duration: 320, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
					);
				}
			}
		}
	});

	// первичная синхронизация (на случай rewind/стартового индекса)
	renderInfo(swiper.realIndex || 0);
};

document.addEventListener('DOMContentLoaded', initGirlsSelect);
