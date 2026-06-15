// Главная сцена: coverflow-слайдер (центр + боковые) по стрелкам + видео по play
//
// ВАЖНО (для бэкенда): список фото галереи и ссылка на видео НЕ зашиты в JS.
// Источник — РАЗМЕТКА: атрибуты data-photos (JSON-массив) и data-video на
// элементе .show-stage__slider[data-stage]. JS только читает их из DOM.
// Если атрибутов нет — fallback на текущие src картинок в слотах.

const PUBLIC = typeof __PUBLIC__ !== 'undefined' ? __PUBLIC__ : '';
const FALLBACK_VIDEO = PUBLIC + 'assets/files/video.mp4';

const initShowStage = () => {
	document.querySelectorAll('.show-stage [data-stage]').forEach(stage => {
		// Список фото — из разметки (data-photos), иначе из текущих src слотов
		let POOL = [];
		try { POOL = JSON.parse(stage.dataset.photos || '[]'); } catch (err) { POOL = []; }
		if (!POOL.length) {
			POOL = Array.from(stage.querySelectorAll('.show-stage__slots img'))
				.map(img => img.getAttribute('src'))
				.filter(Boolean);
		}
		if (!POOL.length) return;
		const videoSrc = stage.dataset.video || FALLBACK_VIDEO;
		// 4 боковых слота в DOM-порядке: outer-left, inner-left, inner-right, outer-right
		const sideImgs = stage.querySelectorAll('.show-stage__slot--side img');
		const prev = stage.querySelector('.show-stage__nav-btn--prev');
		const next = stage.querySelector('.show-stage__nav-btn--next');
		const play = stage.querySelector('.show-stage__play');
		const center = stage.querySelector('.show-stage__slot--center');

		if (!sideImgs.length || !center) return;

		let cursor = 0;
		const len = POOL.length;
		// позиции coverflow: [outer-left, inner-left, CENTER(=2), inner-right, outer-right]
		const sideOrder = [0, 1, 3, 4];

		// Если в центре сейчас <video> — вернуть на его место картинку и показать play
		const stopVideo = () => {
			const video = center.querySelector('video');
			if (!video) return;
			const img = document.createElement('img');
			img.className = 'show-stage__center-img';
			img.alt = 'Главная сцена Le Rouge';
			img.loading = 'lazy';
			video.replaceWith(img);
			if (play) play.style.display = '';
		};

		const render = () => {
			sideImgs.forEach((img, i) => {
				img.src = POOL[(cursor + sideOrder[i]) % len];
			});
			const centerImg = center.querySelector('.show-stage__center-img');
			if (centerImg && centerImg.tagName === 'IMG') {
				centerImg.src = POOL[(cursor + 2) % len];
			}
		};

		let animating = false;
		const move = dir => {
			if (animating) return;
			animating = true;
			stopVideo(); // при листании останавливаем видео и возвращаем картинку
			cursor = (cursor + dir + len) % len;
			// Плавная смена кадров (кроссфейд): гасим картинки → меняем src → проявляем,
			// иначе листание происходило мгновенно, без анимации.
			stage.querySelectorAll('.show-stage__slot img').forEach(img => { img.style.opacity = '0'; });
			setTimeout(() => {
				render();
				stage.querySelectorAll('.show-stage__slot img').forEach(img => { img.style.opacity = ''; });
				animating = false;
			}, 220);
		};

		prev?.addEventListener('click', () => move(-1));
		next?.addEventListener('click', () => move(1));

		// Play — заменяет постер на <video> с автопроигрыванием
		play?.addEventListener('click', () => {
			const oldImg = center.querySelector('.show-stage__center-img');
			if (!oldImg || center.querySelector('video')) return;

			const video = document.createElement('video');
			video.className = 'show-stage__center-img show-stage__center-video';
			video.src = videoSrc;
			video.autoplay = true;
			video.controls = true;
			video.playsInline = true;
			video.loop = true;
			oldImg.replaceWith(video);
			play.style.display = 'none';
		});
	});
};

document.addEventListener('DOMContentLoaded', initShowStage);
