const OPEN_CLASS = 'is-open';
const BODY_LOCK_CLASS = 'is-city-locked';

const lockBody = () => {
	const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
	document.body.style.paddingRight = `${scrollBarWidth}px`;
	document.body.classList.add(BODY_LOCK_CLASS);
	document.body.style.overflow = 'hidden';
};

const unlockBody = () => {
	document.body.style.paddingRight = '';
	document.body.classList.remove(BODY_LOCK_CLASS);
	document.body.style.overflow = '';
};

const initCitySwitcher = () => {
	const widget = document.querySelector('.city-switcher');
	if (!widget) return;

	const open = () => {
		widget.classList.add(OPEN_CLASS);
		widget.setAttribute('aria-hidden', 'false');
		lockBody();

		document.dispatchEvent(
			new CustomEvent('city-switcher:opened', { detail: { widget } })
		);
	};

	const close = () => {
		widget.classList.remove(OPEN_CLASS);
		widget.setAttribute('aria-hidden', 'true');
		unlockBody();

		document.dispatchEvent(
			new CustomEvent('city-switcher:closed', { detail: { widget } })
		);
	};

	widget.querySelectorAll('[data-city-close]').forEach(el => {
		el.addEventListener('click', close);
	});

	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && widget.classList.contains(OPEN_CLASS)) {
			close();
		}
	});

	document.addEventListener('city-switcher:open', open);
	document.addEventListener('city-switcher:close', close);
};

document.addEventListener('DOMContentLoaded', initCitySwitcher);
