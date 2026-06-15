// Страница «Мероприятия»:
// - Левое меню анкоров ЗАКРЕПЛЕНО (видно всё время, пока секция в зоне видимости)
// - Скролл = sticky-наложение зон между мероприятиями
// - Стрелки снизу = листают ГАЛЕРЕЮ фото внутри текущего мероприятия (не скроллят к другому)

const initEventsDetail = () => {
	const root = document.querySelector('.events-detail');
	if (!root) return;

	const zones = Array.from(root.querySelectorAll('.events-detail__zone'));
	const anchors = Array.from(root.querySelectorAll('.events-detail__anchor-item'));
	const anchorsRoot = root.querySelector('.events-detail__anchors');
	const nav = root.querySelector('.events-detail__nav');
	const navCounterActive = nav?.querySelector('.events-detail__counter-active');
	const counterNums = nav?.querySelectorAll('.events-detail__counter-num');
	const navCounterTotal = counterNums && counterNums.length > 1 ? counterNums[counterNums.length - 1] : null;
	const prevBtn = nav?.querySelector('.events-detail__nav-btn--prev');
	const nextBtn = nav?.querySelector('.events-detail__nav-btn--next');
	if (!zones.length) return;

	const pad = n => String(n).padStart(2, '0');

	// Галерея фото на каждую зону: источник — сами <img> в разметке (данные в DOM, не в JS)
	const galleries = zones.map(z => {
		const slides = Array.from(z.querySelectorAll('.events-detail__photo-img'));
		let photoIndex = slides.findIndex(s => s.classList.contains('is-active'));
		if (photoIndex < 0) {
			photoIndex = 0;
			slides[0]?.classList.add('is-active');
		}
		return { slides, photoIndex };
	});

	let currentIndex = 0;

	const updateCounter = () => {
		const g = galleries[currentIndex];
		if (!g) return;
		if (navCounterActive) navCounterActive.textContent = pad(g.photoIndex + 1);
		if (navCounterTotal) navCounterTotal.textContent = pad(g.slides.length);
	};

	const setActive = index => {
		currentIndex = index;
		anchors.forEach((a, i) => a.classList.toggle('is-active', i === index));
		updateCounter();
	};

	// Стрелки — листают галерею ТЕКУЩЕГО мероприятия (без скролла к другой зоне)
	const cyclePhoto = dir => {
		const g = galleries[currentIndex];
		if (!g || g.slides.length < 2) return;
		g.slides[g.photoIndex]?.classList.remove('is-active');
		g.photoIndex = (g.photoIndex + dir + g.slides.length) % g.slides.length;
		g.slides[g.photoIndex]?.classList.add('is-active');
		if (navCounterActive) navCounterActive.textContent = pad(g.photoIndex + 1);
	};

	prevBtn?.addEventListener('click', () => cyclePhoto(-1));
	nextBtn?.addEventListener('click', () => cyclePhoto(1));

	// Скролл — активное мероприятие + видимость меню/навигации
	let ticking = false;
	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			const mid = window.innerHeight / 2;
			let active = 0;
			zones.forEach((z, i) => {
				const r = z.getBoundingClientRect();
				if (r.top <= mid && r.bottom > mid) active = i;
			});
			if (active !== currentIndex) setActive(active);

			const rootRect = root.getBoundingClientRect();
			const inView = rootRect.top < window.innerHeight && rootRect.bottom > 0;
			// Меню закреплено — видно пока секция в зоне видимости (не только на первом баннере)
			if (anchorsRoot) anchorsRoot.classList.toggle('is-hidden', !inView);

			// Стрелки галереи прячем, когда плашка-карточка наехала на фото
			let cardCovering = false;
			const card = zones[active]?.querySelector('.events-detail__info');
			if (card) cardCovering = card.getBoundingClientRect().top <= window.innerHeight * 0.5;
			if (nav) nav.classList.toggle('is-hidden', !inView || cardCovering);
			ticking = false;
		});
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
	updateCounter();

	// =========================================
	// Плавный авто-доскролл плашки-карточки (как на halls)
	// Листаешь вниз, карточка НАЧАЛА появляться → после паузы мягко доводим её до верха.
	// Только вниз, с дебаунсом и паузой — чтобы не дёргало пользователя.
	// =========================================
	let snapTimer = null;
	let programmatic = false;
	let lastY = window.scrollY;
	const EARLY = 0.92; // карточка приподнялась (top < 92% экрана) → доскроллить

	const maybeSnap = () => {
		if (programmatic) return;
		clearTimeout(snapTimer);
		snapTimer = setTimeout(() => {
			const y = window.scrollY;
			const goingDown = y > lastY + 2;
			lastY = y;
			if (!goingDown) return;

			const rr = root.getBoundingClientRect();
			if (rr.top > window.innerHeight * 0.5 || rr.bottom < window.innerHeight * 0.5) return;

			const card = zones[currentIndex]?.querySelector('.events-detail__info');
			if (!card) return;
			const top = card.getBoundingClientRect().top;
			if (top > 4 && top < window.innerHeight * EARLY) {
				programmatic = true;
				window.scrollTo({ top: y + top, behavior: 'smooth' });
				setTimeout(() => {
					programmatic = false;
					lastY = window.scrollY;
				}, 700);
			}
		}, 90);
	};
	window.addEventListener('scroll', maybeSnap, { passive: true });

	// Клик по анкору — скролл к мероприятию
	anchors.forEach((a, i) => {
		const link = a.querySelector('.events-detail__anchor');
		if (!link) return;
		link.addEventListener('click', e => {
			e.preventDefault();
			const z = zones[i];
			if (z) window.scrollTo({ top: z.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });
		});
	});

	// =========================================
	// MOBILE: tabs + arrows
	// =========================================
	const mobile = root.querySelector('.events-detail__mobile');
	if (mobile) {
		const events = Array.from(zones).map(z => {
			const photos = Array.from(z.querySelectorAll('.events-detail__photo-img')).map(img => img.getAttribute('src'));
			return {
				photos,
				photo: photos[0],
				cta: z.querySelector('.events-detail__card-btn-text')?.textContent?.trim(),
				// контекст для бэка — что бронируем (берём из data-object кнопки зоны)
				object: z.querySelector('[data-object]')?.getAttribute('data-object') || ''
			};
		});

		const heroImg = mobile.querySelector('.events-detail__mobile-hero-img');
		const tabs = Array.from(mobile.querySelectorAll('.events-detail__mobile-tab'));
		const galleryImgs = mobile.querySelectorAll('.events-detail__mobile-gallery-img');
		const mobileCta = mobile.querySelector('.events-detail__mobile-cta');
		const ctaText = mobile.querySelector('.events-detail__mobile-cta .events-detail__card-btn-text');
		const mobilePrev = mobile.querySelector('.events-detail__mobile-arrow--prev');
		const mobileNext = mobile.querySelector('.events-detail__mobile-arrow--next');
		const gallery = mobile.querySelector('.events-detail__mobile-gallery');
		const galleryItems = Array.from(mobile.querySelectorAll('.events-detail__mobile-gallery-item'));

		let mobileIndex = 0;
		let galleryIndex = 0;

		// Стрелки — листают ФОТО текущего мероприятия (скролл галереи к нужному кадру)
		const scrollGalleryTo = idx => {
			if (!gallery || !galleryItems.length) return;
			galleryIndex = (idx + galleryItems.length) % galleryItems.length;
			const target = galleryItems[galleryIndex];
			if (target) gallery.scrollTo({ left: target.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
		};

		// Клик по табу — переключает МЕРОПРИЯТИЕ (фото галереи сбрасываются на первое)
		const renderMobile = i => {
			const e = events[i];
			if (!e) return;
			mobileIndex = i;
			galleryIndex = 0;
			if (heroImg) heroImg.src = e.photo;
			galleryImgs.forEach((img, gi) => { img.src = e.photos[gi] || e.photo; });
			if (ctaText) ctaText.textContent = e.cta || 'организовать';
			if (mobileCta) mobileCta.setAttribute('data-object', e.object || '');

			tabs.forEach((t, j) => {
				t.classList.toggle('is-active', j === i);
				t.setAttribute('aria-selected', j === i ? 'true' : 'false');
			});

			if (gallery) gallery.scrollTo({ left: 0, behavior: 'smooth' });
		};

		tabs.forEach((t, i) => {
			t.addEventListener('click', () => renderMobile(i));
		});
		mobilePrev?.addEventListener('click', () => scrollGalleryTo(galleryIndex - 1));
		mobileNext?.addEventListener('click', () => scrollGalleryTo(galleryIndex + 1));
	}
};

document.addEventListener('DOMContentLoaded', initEventsDetail);
