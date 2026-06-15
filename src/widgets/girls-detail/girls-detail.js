// Страница «Девушки»:
// - стрелки над фото переключают ФОТО выбранной девушки
// - кружочки справа переключают саму ДЕВУШКУ
//
// ВАЖНО (для бэкенда): данные девушек НЕ зашиты в этот файл.
// Источник истины — РАЗМЕТКА: каждая аватарка .girls-detail__avatar-item
// несёт поля девушки в data-* атрибутах (data-name/age/params/zodiac/bio/
// loves/dislikes/photos[JSON]/stats[JSON]). JS только читает их из DOM.
// Бэкенд рендерит этот список из Bitrix — скрипт подхватывает автоматически.

const initGirlsDetail = () => {
	const root = document.querySelector('.girls-detail');
	if (!root) return;

	const photoBox = root.querySelector('.girls-detail__photo');
	const numActive = root.querySelector('.girls-detail__photo-num.is-active');
	const numTotal = root.querySelectorAll('.girls-detail__photo-num')[1];
	const prev = root.querySelector('.girls-detail__photo-btn--prev');
	const next = root.querySelector('.girls-detail__photo-btn--next');
	const nameEl = root.querySelector('.girls-detail__name');
	const metaItems = root.querySelectorAll('.girls-detail__meta-item');
	const statsRoot = root.querySelector('.girls-detail__stats');
	const bioText = root.querySelector('.girls-detail__bio-text');
	const prefTexts = root.querySelectorAll('.girls-detail__pref-text');
	const avatars = root.querySelectorAll('.girls-detail__avatar-item');
	const avatarPrev = root.querySelector('.girls-detail__avatar-btn--prev');
	const avatarNext = root.querySelector('.girls-detail__avatar-btn--next');
	const mobileAvatars = root.querySelectorAll('.girls-detail__mobile-avatar-item');
	const statTemplate = statsRoot?.querySelector('.girls-detail__stat')?.cloneNode(true) || null;

	// === Данные читаем ИЗ РАЗМЕТКИ (data-* на аватарках) ===
	const parseJSON = (str, fallback) => {
		try { return JSON.parse(str); } catch (err) { return fallback; }
	};
	const POOL = Array.from(avatars).map(a => ({
		name: a.dataset.name || '',
		age: a.dataset.age || '',
		params: a.dataset.params || '',
		zodiac: a.dataset.zodiac || '',
		photos: parseJSON(a.dataset.photos, []),
		stats: parseJSON(a.dataset.stats, []),
		bio: a.dataset.bio || '',
		loves: a.dataset.loves || '',
		dislikes: a.dataset.dislikes || ''
	}));
	if (!POOL.length) return;

	let girlIndex = 0;   // индекс выбранной девушки
	let photoIndex = 0;  // индекс текущего фото внутри photos[] девушки

	const pad = n => String(n).padStart(2, '0');
	const syncAvatarScroll = (behavior = 'smooth') => {
		avatars[girlIndex]?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
		mobileAvatars[girlIndex]?.scrollIntoView({ behavior, block: 'nearest', inline: 'center' });
	};

	const syncStats = stats => {
		if (!statsRoot || !statTemplate) return;
		statsRoot.textContent = '';

		stats.forEach(statData => {
			const stat = statTemplate.cloneNode(true);
			const label = stat.querySelector('.girls-detail__stat-label');
			const value = stat.querySelector('.girls-detail__stat-value');
			const fill = stat.querySelector('.girls-detail__stat-fill');

			if (label) label.textContent = statData.label;
			if (value) value.textContent = `${statData.value}%`;
			if (fill) fill.style.width = `${statData.value}%`;

			statsRoot.appendChild(stat);
		});
	};

	const renderGirlData = () => {
		const g = POOL[girlIndex];
		if (!g) return;

		// имя (сохраняем иконку зодиака внутри заголовка)
		if (nameEl) {
			const zodiacIcon = nameEl.querySelector('.girls-detail__zodiac-icon');
			nameEl.textContent = g.name + ' ';
			if (zodiacIcon) nameEl.appendChild(zodiacIcon);
		}

		// мета
		if (metaItems.length >= 3) {
			metaItems[0].textContent = g.age;
			metaItems[1].textContent = g.params;
			metaItems[2].textContent = g.zodiac;
		}

		// статы
		syncStats(g.stats);

		// био
		if (bioText) bioText.textContent = g.bio;
		if (prefTexts[0]) prefTexts[0].textContent = g.loves;
		if (prefTexts[1]) prefTexts[1].textContent = g.dislikes;

		// активная аватарка (desktop + mobile)
		avatars.forEach((a, i) => {
			a.classList.toggle('is-active', i === girlIndex % avatars.length);
		});
		mobileAvatars.forEach((a, i) => {
			a.classList.toggle('is-active', i === girlIndex % mobileAvatars.length);
		});

		syncAvatarScroll();
	};

	// Фото активной девушки: приоритет — data-photos аватарки;
	// если его нет — берём <img>, которые бэкенд вывел циклом прямо в фото-блоке.
	const getActivePhotos = () => {
		const g = POOL[girlIndex];
		if (g && g.photos && g.photos.length) return g.photos;
		return Array.from(photoBox.querySelectorAll('.girls-detail__photo-img'))
			.map(im => im.getAttribute('src'))
			.filter(Boolean);
	};

	const renderPhoto = () => {
		const photos = getActivePhotos();
		if (!photos.length) return;
		const g = POOL[girlIndex];
		const idx = ((photoIndex % photos.length) + photos.length) % photos.length;

		// Синхронизируем количество <img> в блоке с числом фото девушки.
		// (несколько <img> = слайдер; видна только .is-active — не накладываются)
		let imgs = Array.from(photoBox.querySelectorAll('.girls-detail__photo-img'));
		if (imgs.length !== photos.length) {
			imgs.forEach(im => im.remove());
			const frag = document.createDocumentFragment();
			photos.forEach((src, i) => {
				const im = document.createElement('img');
				im.className = 'girls-detail__photo-img';
				im.alt = g ? g.name : '';
				// первой картинке — приоритетная загрузка (LCP), остальным lazy
				if (i === 0) {
					im.fetchPriority = 'high';
				} else {
					im.loading = 'lazy';
				}
				im.src = src;
				frag.appendChild(im);
			});
			const photoGradient = photoBox.querySelector('.girls-detail__photo-gradient');
			photoBox.insertBefore(frag, photoGradient || photoBox.firstChild);
			imgs = Array.from(photoBox.querySelectorAll('.girls-detail__photo-img'));
		} else {
			// то же количество, но сменилась девушка — обновим src
			imgs.forEach((im, i) => {
				if (im.getAttribute('src') !== photos[i]) im.src = photos[i];
			});
		}

		// видна только активная картинка
		imgs.forEach((im, i) => {
			im.alt = g ? g.name : '';
			im.classList.toggle('is-active', i === idx);
		});

		// счётчик: 0X — 0N где N = всего фото у выбранной девушки
		if (numActive) numActive.textContent = pad(idx + 1);
		if (numTotal) numTotal.textContent = pad(photos.length);
		[prev, next].forEach(btn => btn?.toggleAttribute('disabled', photos.length < 2));
	};

	// Плавная смена с fade-анимацией
	let animating = false;
	const FADE_MS = 280;

	const animate = (fn) => {
		if (animating) return;
		animating = true;
		root.classList.add('is-transitioning');
		setTimeout(() => {
			fn();
			root.classList.remove('is-transitioning');
			animating = false;
		}, FADE_MS);
	};

	// Фейд ТОЛЬКО фото (характеристики/карточка не анимируются)
	const animatePhoto = (fn) => {
		if (animating) return;
		animating = true;
		root.classList.add('is-photo-transitioning');
		setTimeout(() => {
			fn();
			root.classList.remove('is-photo-transitioning');
			animating = false;
		}, FADE_MS);
	};

	// === Стрелки над фото — переключение ФОТО внутри текущей девушки (фейд только фото) ===
	const nextPhoto = () => animatePhoto(() => { photoIndex += 1; renderPhoto(); });
	const prevPhoto = () => animatePhoto(() => { photoIndex -= 1; renderPhoto(); });

	prev?.addEventListener('click', prevPhoto);
	next?.addEventListener('click', nextPhoto);

	// === Аватарки справа — переключение ДЕВУШКИ (сбрасываем photoIndex) ===
	const selectGirl = (i) => animate(() => {
		girlIndex = ((i % POOL.length) + POOL.length) % POOL.length;
		photoIndex = 0;
		renderGirlData();
		renderPhoto();
	});

	avatars.forEach((a, i) => {
		a.addEventListener('click', () => {
			if (i === girlIndex % avatars.length) return;
			selectGirl(i);
		});
	});
	mobileAvatars.forEach((a, i) => {
		a.addEventListener('click', () => {
			if (i === girlIndex % mobileAvatars.length) return;
			selectGirl(i);
		});
	});

	// Стрелки возле аватарок — prev/next ДЕВУШКА
	avatarPrev?.addEventListener('click', () => selectGirl(girlIndex - 1));
	avatarNext?.addEventListener('click', () => selectGirl(girlIndex + 1));
	[avatarPrev, avatarNext].forEach(btn => btn?.toggleAttribute('disabled', POOL.length < 2));

	// Первичный рендер
	renderGirlData();
	renderPhoto();
	syncAvatarScroll('auto');
};

document.addEventListener('DOMContentLoaded', initGirlsDetail);
