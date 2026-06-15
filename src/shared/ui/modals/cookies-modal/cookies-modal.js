const STORAGE_KEY = 'cookies-accepted';
const SHOW_DELAY = 800;

const hasAccepted = () => {
	try {
		return localStorage.getItem(STORAGE_KEY) === 'true';
	} catch (_) {
		return false;
	}
};

const setAccepted = () => {
	try {
		localStorage.setItem(STORAGE_KEY, 'true');
	} catch (_) {
		// noop — localStorage может быть недоступен
	}
};

const hide = notice => {
	notice.classList.remove('is-visible');
	setTimeout(() => {
		notice.hidden = true;
	}, 350);
};

const show = notice => {
	notice.hidden = false;
	requestAnimationFrame(() => {
		notice.classList.add('is-visible');
	});
};

document.addEventListener('DOMContentLoaded', () => {
	const notice = document.querySelector('[data-cookies-notice]');
	if (!notice) return;

	if (hasAccepted()) return;

	notice.querySelectorAll('[data-cookies-accept]').forEach(btn => {
		btn.addEventListener('click', () => {
			setAccepted();
			hide(notice);
		});
	});

	notice.querySelectorAll('[data-cookies-close]').forEach(btn => {
		btn.addEventListener('click', () => {
			hide(notice);
		});
	});

	setTimeout(() => show(notice), SHOW_DELAY);
});
