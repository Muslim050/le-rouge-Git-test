import { dispatch } from '@/shared/lib';

// База для загрузки модалок. Модалки лежат рядом с assets (корень деплоя/шаблона).
// Чтобы fetch работал на ЛЮБОЙ глубине URL (вкл. ЧПУ Bitrix /events/), резолвим
// абсолютную базу, а не относительный путь:
//   1) если задан __PUBLIC__ (сборка с PUBLIC_PATH) — берём его;
//   2) иначе вычисляем корень из <script src=".../assets/js/main.js">;
//   3) иначе '' (относительный путь — как раньше).
const PUBLIC = typeof __PUBLIC__ !== 'undefined' ? __PUBLIC__ : '';
const resolveBase = () => {
	if (PUBLIC) return PUBLIC;
	const script = Array.from(document.scripts).find(s =>
		/assets\/js\/main(\.[\w-]+)?\.js(\?|$)/.test(s.src)
	);
	if (script) {
		const m = script.src.match(/^(.*\/)assets\/js\/main(\.[\w-]+)?\.js/);
		if (m) return m[1]; // корень деплоя с завершающим '/'
	}
	return '';
};
const MODAL_BASE = resolveBase();

const header = document.querySelector('.header');
const originalOverflow = document.body.style.overflow;

const getScrollBarWidth = () => {
	return window.innerWidth - document.documentElement.clientWidth;
};

export const closeModal = (modal, modalName) => {
	if (!modal) return;

	modal.classList.remove('active');

	dispatch({
		el: document,
		name: 'modal:close',
		detail: { modal }
	});

	if (modalName) {
		dispatch({
			el: document,
			name: `modal:close-${modalName}`,
			detail: { modal }
		});
	}

	setTimeout(() => {
		document.body.style.overflow = originalOverflow;
		document.body.style.paddingRight = '0px';

		if (header) {
			header.style.paddingRight = '0px';
			header.classList.remove('modal-open');
		}
	}, 300);
};

const openModal = (modal, modalName) => {
	if (!modal) return;

	const scrollBarWidth = getScrollBarWidth();

	document.body.style.overflow = 'hidden';
	document.body.style.paddingRight = `${scrollBarWidth}px`;

	if (header) {
		header.style.paddingRight = `${scrollBarWidth}px`;
		header.classList.add('modal-open');
	}

	modal.classList.add('active');

	setTimeout(() => {
		modal.classList.add('modal-opening');
	}, 10);

	setTimeout(() => {
		modal.classList.remove('modal-opening');
	}, 410);

	dispatch({
		el: document,
		name: 'modal:open',
		detail: { modal }
	});

	if (modalName) {
		dispatch({
			el: document,
			name: `modal:open-${modalName}`,
			detail: { modal }
		});
	}
};

// Прокидывает контекст (объект, с которого открыли модалку) в скрытые поля формы.
// Пример: бронь стола из карточки зала → object = "VIP-зал «Рубин»".
const applyModalContext = (modal, context) => {
	if (!modal || !context) return;
	const form = modal.querySelector('form');
	if (form) {
		Object.entries(context).forEach(([name, value]) => {
			if (value == null || value === '') return;
			let el = form.querySelector(`input[name="${name}"]`);
			if (!el) {
				el = document.createElement('input');
				el.type = 'hidden';
				el.name = name;
				form.appendChild(el);
			}
			el.value = value;
		});
	}
	// Текстовый вывод объекта (напр. подзаголовок модалки сертификата)
	if (context.object) {
		const elText = modal.querySelector('[data-object-text]');
		if (elText) elText.textContent = context.object;
	}
};

export const loadModal = async (url, context) => {
	const modalsBlock = document.querySelector('.modals');
	if (!modalsBlock) {
		console.error('[Modal] .modals container not found');
		return;
	}

	const modalName = url.split('/').pop().replace('.html', '');

	const existingModal = modalsBlock.querySelector(`.modal[data-modal="${modalName}"]`);

	if (existingModal) {
		applyModalContext(existingModal, context);
		openModal(existingModal, modalName);
		return;
	}

	try {
		const response = await fetch(MODAL_BASE + url);
		if (!response.ok) throw new Error('Ошибка загрузки');

		const html = await response.text();
		const wrapper = document.createElement('div');
		wrapper.innerHTML = html;

		const modal = wrapper.firstElementChild;
		if (!modal) throw new Error('Modal not found');

		const actualModalName = modal.getAttribute('data-modal');

		const doubleCheck = modalsBlock.querySelector(`.modal[data-modal="${actualModalName}"]`);
		if (doubleCheck) {
			applyModalContext(doubleCheck, context);
			openModal(doubleCheck, actualModalName);
			return;
		}

		modalsBlock.appendChild(modal);

		bindModalEvents(modal);

		// контекст (объект/страница) — в скрытые поля формы модалки
		applyModalContext(modal, context);

		dispatch({
			el: document,
			name: `modal:mounted-${actualModalName}`,
			detail: { modal }
		});

		setTimeout(() => {
			openModal(modal, actualModalName);
		}, 10);
	} catch (err) {
		console.error(`[Modal] Error loading modal:`, err);
	}
};

const bindOpenButtons = () => {
	document.querySelectorAll('[data-modal-load]').forEach(btn => {
		if (btn.dataset.modalInitialized === 'true') {
			return;
		}

		const url = btn.getAttribute('data-modal-load');
		if (!url) return;

		const handleClick = (e) => {
			e.preventDefault();
			// Контекст для бэка: что бронируем (data-object) + текущая страница
			const context = {
				object: btn.getAttribute('data-object') || '',
				page: window.location.pathname + window.location.search,
				page_title: document.title
			};
			loadModal(url, context);
		};

		btn.addEventListener('click', handleClick);

		btn.dataset.modalInitialized = 'true';

		btn._modalClickHandler = handleClick;
	});

	document.querySelectorAll('[data-modal-target]').forEach(btn => {
		if (btn.dataset.modalTargetInitialized === 'true') {
			return;
		}

		const modalName = btn.getAttribute('data-modal-target');
		if (!modalName) return;

		const handleClick = (e) => {
			e.preventDefault();
			const modal = document.querySelector(`.modal[data-modal="${modalName}"]`);
			openModal(modal, modalName);
		};

		btn.addEventListener('click', handleClick);

		btn.dataset.modalTargetInitialized = 'true';

		btn._modalTargetClickHandler = handleClick;
	});
};

const bindModalEvents = (modal) => {
	const modalName = modal.getAttribute('data-modal');

	if (modal.dataset.eventsbound === 'true') {
		return;
	}

	modal.addEventListener('click', e => {
		if (e.target === modal || e.target.classList.contains('modal-content')) {
			closeModal(modal, modalName || undefined);
		}
	});

	const modalInnerWrapper = modal.querySelector('.modal-inner-wrapper');
	if (modalInnerWrapper) {
		modalInnerWrapper.addEventListener('click', e => {
			e.stopPropagation();
		});
	}

	modal.querySelectorAll('.close-modal, .modal-close-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			closeModal(modal, modalName || undefined);
		});
	});

	modal.dataset.eventsbound = 'true';
};

const initExistingModals = () => {
	document.querySelectorAll('.modal').forEach(modal => {
		bindModalEvents(modal);
	});
};

bindOpenButtons();
initExistingModals();

document.addEventListener('modal:open', (e) => {
	const { modalName } = e.detail;
	if (modalName) {
		const modal = document.querySelector(`.modal[data-modal="${modalName}"]`);
		if (modal) {
			openModal(modal, modalName);
		} else {
			console.warn(`[Modal] Modal not found in DOM: ${modalName}`);
		}
	}
});
