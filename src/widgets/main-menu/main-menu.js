const OPEN_CLASS = 'is-open';
const BODY_LOCK_CLASS = 'is-menu-locked';

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

const initMainMenu = () => {
	const menu = document.querySelector('.main-menu');
	if (!menu) return;

	const open = () => {
		menu.classList.add(OPEN_CLASS);
		menu.setAttribute('aria-hidden', 'false');
		lockBody();

		document.dispatchEvent(
			new CustomEvent('main-menu:opened', { detail: { menu } })
		);
	};

	const close = () => {
		menu.classList.remove(OPEN_CLASS);
		menu.setAttribute('aria-hidden', 'true');
		unlockBody();

		document.dispatchEvent(
			new CustomEvent('main-menu:closed', { detail: { menu } })
		);
	};

	// Любой элемент с data-menu-close внутри меню закрывает его.
	// Если у элемента есть data-scroll-to="id" — после закрытия плавно скроллим к секции
	menu.querySelectorAll('[data-menu-close]').forEach(el => {
		el.addEventListener('click', (e) => {
			const scrollTarget = el.getAttribute('data-scroll-to');
			if (scrollTarget) {
				e.preventDefault();
				close();
				const target = document.getElementById(scrollTarget);
				if (target) {
					setTimeout(() => {
						target.scrollIntoView({ behavior: 'smooth', block: 'start' });
					}, 50);
				}
			} else {
				close();
			}
		});
	});

	// ESC закрывает
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && menu.classList.contains(OPEN_CLASS)) {
			close();
		}
	});

	// Слушаем команду открытия от шапки
	document.addEventListener('main-menu:open', open);
	document.addEventListener('main-menu:close', close);

	// Lang switcher внутри меню
	const langItems = menu.querySelectorAll('.main-menu__lang-item');
	langItems.forEach(item => {
		item.addEventListener('click', () => {
			langItems.forEach(i => i.classList.remove('is-active'));
			item.classList.add('is-active');
		});
	});
};

document.addEventListener('DOMContentLoaded', initMainMenu);
