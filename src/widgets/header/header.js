const SCROLL_OFFSET = 50;

const initHeaderScroll = header => {
	let isScrolled = false;

	const update = () => {
		const shouldScroll = window.scrollY > SCROLL_OFFSET;

		if (shouldScroll === isScrolled) return;

		isScrolled = shouldScroll;
		header.classList.toggle('is-scrolled', isScrolled);
	};

	update();
	window.addEventListener('scroll', update, { passive: true });
};

const initLangSwitcher = header => {
	const items = header.querySelectorAll('.header__lang-item');
	if (!items.length) return;

	items.forEach(item => {
		item.addEventListener('click', () => {
			items.forEach(i => i.classList.remove('is-active'));
			item.classList.add('is-active');
		});
	});
};

const initCityToggle = header => {
	const cityButtons = header.querySelectorAll('.header__city');

	cityButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			btn.setAttribute('aria-expanded', 'true');
			document.dispatchEvent(new CustomEvent('city-switcher:open'));
		});
	});

	document.addEventListener('city-switcher:closed', () => {
		cityButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
	});
};

const initMenuToggle = header => {
	const menuBtn = header.querySelector('.header__menu-btn');
	if (!menuBtn) return;

	menuBtn.addEventListener('click', () => {
		menuBtn.setAttribute('aria-expanded', 'true');
		document.dispatchEvent(new CustomEvent('main-menu:open'));
	});

	document.addEventListener('main-menu:closed', () => {
		menuBtn.setAttribute('aria-expanded', 'false');
	});
};

document.addEventListener('DOMContentLoaded', () => {
	const header = document.querySelector('.header');
	if (!header) return;

	initHeaderScroll(header);
	initLangSwitcher(header);
	initCityToggle(header);
	initMenuToggle(header);
});
