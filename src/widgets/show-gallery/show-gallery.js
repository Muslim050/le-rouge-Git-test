import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

// «Галерея» на странице Девушки (show-gallery):
// - клик по фото → превью в лайтбоксе;
// - «+» → подгрузка ещё карточек ИЗ МОК-ПУЛА (источник — уже отрисованные карточки
//   разметки; бэкенд заменит на реальную пагинацию, сохранив структуру карточек).
const initShowGallery = () => {
	const section = document.querySelector('.show-gallery');
	if (!section) return;

	const grid = section.querySelector('.show-gallery__grid');
	const cols = Array.from(section.querySelectorAll('.show-gallery__col'));
	const moreBtn = section.querySelector('.show-gallery__more');
	const fade = section.querySelector('.show-gallery__fade');
	if (!grid || !cols.length) return;

	// Мок-пул = карточки из разметки (src + размер). Циклом по нему «+» добавляет ещё.
	const pool = Array.from(grid.querySelectorAll('.show-gallery__card'))
		.map(card => ({
			src: card.querySelector('img')?.getAttribute('src') || '',
			tall: card.classList.contains('show-gallery__card--tall')
		}))
		.filter(item => item.src);

	// курсор-лупа на карточках (есть и у будущих, добавленных «+»)
	grid.querySelectorAll('.show-gallery__card').forEach(card => {
		card.style.cursor = 'zoom-in';
	});

	// --- Превью по клику. Список собираем на лету — после «+» карточек больше. ---
	grid.addEventListener('click', event => {
		const img = event.target.closest('.show-gallery__card img');
		if (!img) return;
		const imgs = Array.from(grid.querySelectorAll('.show-gallery__card img'));
		const items = imgs.map(el => ({ src: el.getAttribute('src'), type: 'image' }));
		const startIndex = imgs.indexOf(img);
		Fancybox.show(items, { startIndex: startIndex < 0 ? 0 : startIndex });
	});

	// --- «+» : снять обрезку-тизер и добавить ещё карточек из мок-пула. ---
	if (moreBtn && pool.length) {
		let cursor = 0;
		// Высота КОНТЕНТА колонки = сумма высот карточек. Брать col.offsetHeight нельзя:
		// колонки — flex-дети (align-items:stretch) и растянуты до одной высоты → все
		// одинаковые, и новые карточки сыпались в первую колонку (ломая сетку).
		const colWeight = col =>
			Array.from(col.querySelectorAll('.show-gallery__card'))
				.reduce((sum, card) => sum + card.offsetHeight, 0);
		const shortestCol = () => {
			const visible = cols.filter(c => getComputedStyle(c).display !== 'none');
			return visible.reduce((a, b) => (colWeight(b) < colWeight(a) ? b : a), visible[0]);
		};
		moreBtn.addEventListener('click', () => {
			// первый клик снимает обрезку (max-height + фейд) — показываем всё
			grid.style.maxHeight = 'none';
			if (fade) fade.style.display = 'none';

			const visibleCols = cols.filter(c => getComputedStyle(c).display !== 'none');
			const batch = visibleCols.length * 2; // по 2 карточки на видимую колонку
			for (let i = 0; i < batch; i += 1) {
				const item = pool[cursor % pool.length];
				cursor += 1;
				const fig = document.createElement('figure');
				fig.className = `show-gallery__card show-gallery__card--${item.tall ? 'tall' : 'short'}`;
				fig.style.cursor = 'zoom-in';
				const img = document.createElement('img');
				img.src = item.src;
				img.loading = 'lazy';
				img.alt = 'Галерея Le Rouge';
				fig.appendChild(img);
				shortestCol().appendChild(fig);
			}
		});
	}
};

document.addEventListener('DOMContentLoaded', initShowGallery);
