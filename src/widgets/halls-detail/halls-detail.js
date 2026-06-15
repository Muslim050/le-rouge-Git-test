// Страница «Залы»:
// - Левое меню «якоря» ЗАКРЕПЛЕНО (видно всё время, пока секция в зоне видимости)
// - Скролл = sticky-наложение зон между залами (+ scroll-snap в CSS)
// - Стрелки снизу = листают ГАЛЕРЕЮ фото внутри текущего зала (не скроллят к другому)
// - Стрелки прячутся, когда плашка-карточка наехала на фото

const initHallsDetail = () => {
	const root = document.querySelector('.halls-detail');
	if (!root) return;

	const zones = Array.from(root.querySelectorAll('.halls-detail__zone'));
	const anchors = Array.from(root.querySelectorAll('.halls-detail__anchor-item'));
	const anchorsRoot = root.querySelector('.halls-detail__anchors');
	const nav = root.querySelector('.halls-detail__nav');
	const navCounterActive = nav?.querySelector('.halls-detail__counter-active');
	const counterNums = nav?.querySelectorAll('.halls-detail__counter-num');
	const navCounterTotal = counterNums && counterNums.length > 1 ? counterNums[counterNums.length - 1] : null;
	const prevBtn = nav?.querySelector('.halls-detail__nav-btn--prev');
	const nextBtn = nav?.querySelector('.halls-detail__nav-btn--next');
	if (!zones.length) return;

	const pad = n => String(n).padStart(2, '0');

	// Галерея фото на каждую зону: источник — сами <img.halls-detail__photo-img> в разметке.
	// Листаем классом is-active (crossfade в CSS). Активное = с классом is-active (иначе первое).
	const galleries = zones.map(z => {
		const slides = Array.from(z.querySelectorAll('.halls-detail__photo-img'));
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

	// Стрелки — листают галерею ТЕКУЩЕГО зала (без скролла к другой зоне)
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

	// Скролл — активный зал + видимость меню/навигации
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
			// Меню закреплено — видно пока секция в зоне видимости
			if (anchorsRoot) anchorsRoot.classList.toggle('is-hidden', !inView);

			// Стрелки галереи прячем, когда плашка-карточка наехала на фото
			let cardCovering = false;
			const card = zones[active]?.querySelector('.halls-detail__info');
			if (card) cardCovering = card.getBoundingClientRect().top <= window.innerHeight * 0.5;
			if (nav) nav.classList.toggle('is-hidden', !inView || cardCovering);
			ticking = false;
		});
	};

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
	updateCounter();

	// =========================================
	// Плавный авто-доскролл плашки-карточки
	// Как только карточка НАЧАЛА появляться (рано) и листаешь вниз —
	// мягко доводим её до конца (плашка полностью наезжает на фото).
	// =========================================
	let snapTimer = null;
	let programmatic = false;
	let lastY = window.scrollY;
	const EARLY = 0.97; // как только плашка ЧУТЬ показалась (top < 97% экрана) → доскроллить

	const maybeSnap = () => {
		if (programmatic) return;
		clearTimeout(snapTimer);
		snapTimer = setTimeout(() => {
			const y = window.scrollY;
			const goingDown = y > lastY + 2;
			lastY = y;
			if (!goingDown) return; // снапим только при листании вниз

			// секция должна занимать экран (середина внутри неё)
			const rr = root.getBoundingClientRect();
			if (rr.top > window.innerHeight * 0.5 || rr.bottom < window.innerHeight * 0.5) return;

			const card = zones[currentIndex]?.querySelector('.halls-detail__info');
			if (!card) return;
			const top = card.getBoundingClientRect().top;

			// карточка частично появилась, но не доехала до верха — плавно доводим
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

	// Клик по анкору — скролл к залу
	anchors.forEach((a, i) => {
		const link = a.querySelector('.halls-detail__anchor');
		if (!link) return;
		link.addEventListener('click', e => {
			e.preventDefault();
			const z = zones[i];
			if (z) window.scrollTo({ top: z.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });
		});
	});

	// =========================================
	// MOBILE: tabs + arrows + content update
	// =========================================
	const mobile = root.querySelector('.halls-detail__mobile');
	if (mobile) {
		// Снимаем данные о каждом зале с DOM зон (источник истины — pug data)
		const halls = Array.from(zones).map(z => {
			const idx = parseInt(z.dataset.index, 10);
			return {
				index: idx,
				photo: z.querySelector('.halls-detail__photo-img')?.src,
				// все фото зала — для листаемой галереи (как в events)
				photos: Array.from(z.querySelectorAll('.halls-detail__photo-img')).map(img => img.getAttribute('src')),
				title: z.querySelector('.halls-detail__title')?.textContent?.trim(),
				karaoke: !!z.querySelector('.halls-detail__title-block .halls-detail__badge'),
				subtitle: z.querySelector('.halls-detail__card-title')?.textContent?.trim(),
				description: z.querySelector('.halls-detail__card-text')?.innerHTML,
				depo: z.querySelectorAll('.halls-detail__card-param-value')[0]?.textContent?.trim(),
				time: z.querySelectorAll('.halls-detail__card-param-value')[1]?.textContent?.trim(),
				hour: z.querySelectorAll('.halls-detail__card-param-value')[2]?.textContent?.trim()
			};
		});

		const heroImg = mobile.querySelector('.halls-detail__mobile-hero-img');
		const tabs = Array.from(mobile.querySelectorAll('.halls-detail__mobile-tab'));
		const panel = mobile.querySelector('.halls-detail__mobile-panel');
		const gallery = mobile.querySelector('.halls-detail__mobile-gallery');
		const galleryItems = Array.from(mobile.querySelectorAll('.halls-detail__mobile-gallery-item'));
		const galleryImgs = mobile.querySelectorAll('.halls-detail__mobile-gallery-img');
		const label = mobile.querySelector('.halls-detail__mobile-label');
		const paramValues = mobile.querySelectorAll('.halls-detail__mobile-param-value');
		const textTitle = mobile.querySelector('.halls-detail__mobile-text-title');
		const textBody = mobile.querySelector('.halls-detail__mobile-text-body');
		const mobilePrev = mobile.querySelector('.halls-detail__mobile-arrow--prev');
		const mobileNext = mobile.querySelector('.halls-detail__mobile-arrow--next');
		// кнопки брони на мобиле — обновляем data-object под текущий зал (контекст для бэка)
		const mobileBookBtns = mobile.querySelectorAll('.halls-detail__mobile-cta [data-modal-load]');

		let mobileIndex = 0;
		let galleryIndex = 0;

		// Стрелки — листают ФОТО текущего зала (скролл галереи к нужному кадру), как в events
		const scrollGalleryTo = idx => {
			if (!gallery || !galleryItems.length) return;
			galleryIndex = (idx + galleryItems.length) % galleryItems.length;
			const target = galleryItems[galleryIndex];
			if (target) gallery.scrollTo({ left: target.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
		};

		// Клик по табу — переключает ЗАЛ (фото галереи сбрасываются на первое)
		const renderMobile = i => {
			const h = halls[i];
			if (!h) return;
			mobileIndex = i;
			galleryIndex = 0;
			mobileBookBtns.forEach(b => b.setAttribute('data-object', h.title || ''));
			if (heroImg) {
				heroImg.src = h.photo;
				heroImg.alt = h.title || 'VIP-залы';
			}
			galleryImgs.forEach((img, gi) => {
				img.src = h.photos[gi] || h.photo;
				img.alt = `${h.title || 'VIP-зал'} — фото ${gi + 1}`;
			});
			if (label) label.classList.toggle('is-visible', h.karaoke);
			if (paramValues[0]) paramValues[0].textContent = h.depo;
			if (paramValues[1]) paramValues[1].textContent = h.time;
			if (paramValues[2]) paramValues[2].textContent = h.hour;
			if (textTitle) textTitle.textContent = h.subtitle;
			if (textBody) textBody.innerHTML = h.description;
			if (panel) panel.setAttribute('aria-labelledby', `halls-mobile-tab-${i}`);

			tabs.forEach((t, j) => {
				t.classList.toggle('is-active', j === i);
				t.setAttribute('aria-selected', j === i ? 'true' : 'false');
				t.setAttribute('tabindex', j === i ? '0' : '-1');
			});
			tabs[i]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

			if (gallery) gallery.scrollTo({ left: 0, behavior: 'smooth' });
		};

		tabs.forEach((t, i) => {
			t.addEventListener('click', () => renderMobile(i));
		});
		mobilePrev?.addEventListener('click', () => scrollGalleryTo(galleryIndex - 1));
		mobileNext?.addEventListener('click', () => scrollGalleryTo(galleryIndex + 1));
	}
};

document.addEventListener('DOMContentLoaded', initHallsDetail);
