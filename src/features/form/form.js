import { closeModal, loadModal } from '@/shared/ui/modal/modal';
import { FormValidator } from '@/shared/lib/validation';

document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('.hero-form');

	if (form) {
		new FormValidator(form);
	}
});

// ============================================================
// API ФОРМ ДЛЯ БЭКЕНДА (всё в window)
// ------------------------------------------------------------
// Фронт success САМ НЕ показывает (авто-success ВЫКЛЮЧЕН). Он только валидирует
// форму и шлёт DOM-событие 'submit-form' (форма — в e.detail.form).
//
// Бэк: слушает это событие (или свой submit формы) → шлёт AJAX → сам открывает окна:
//      window.openSuccessModal()              — окно «успешно»
//      window.openErrorModal()                — окно «ошибка»
//      window.LeRougeForm.closeModal(form)    — закрыть модалку формы
//
// Поля контекста уже в разметке (hidden): form_type, page, object (+ budget/guests у events).
// Ошибка поля с сервера: класс .error на его .form-group + текст в .input__error.
//
// Опционально:
//   window.backendFunc(form, e)        — если удобнее одна функция вместо слушателя события
//   window.LeRougeAutoSuccess = true   — демо без бэка: фронт сам покажет success
// ============================================================
window.LeRougeForm = {
	// Открыть окно «успешно». Путь резолвится через MODAL_BASE (работает на ЧПУ).
	success: () => loadModal('modals/success-modal.html'),
	// Открыть окно «ошибка» (неуспех AJAX).
	fail: () => loadModal('modals/error-modal.html'),
	error: () => loadModal('modals/error-modal.html'), // алиас
	// Закрыть модалку формы.
	closeModal: form => {
		const modal = form?.closest('.modal');
		if (modal) closeModal(modal, modal.getAttribute('data-modal') || undefined);
	},
};
// Явные глобальные функции открытия окон (как просил бэк)
window.openSuccessModal = () => window.LeRougeForm.success();
window.openErrorModal = () => window.LeRougeForm.fail();

// ============================================================
// Глобальный обработчик успешной отправки любой формы.
// FormValidator диспатчит 'submit-form' ТОЛЬКО после успешной валидации.
// ============================================================
// Проставляет/создаёт скрытое поле контекста в форме.
// Непустые значения не затираем (page/object могли заполниться при открытии модалки).
const setContextField = (form, name, value) => {
	let el = form.querySelector(`input[name="${name}"]`);
	if (!el) {
		el = document.createElement('input');
		el.type = 'hidden';
		el.name = name;
		form.appendChild(el);
	}
	if (!el.value) el.value = value;
};

document.addEventListener('submit-form', e => {
	const { form } = e.detail || {};
	if (!form) return;

	// ---- АВТО-КОНТЕКСТ ДЛЯ БЭКА: с какой страницы пришла заявка ----
	setContextField(form, 'page', window.location.pathname + window.location.search);
	setContextField(form, 'page_title', document.title);

	// ---- КАК ПОДКЛЮЧИТЬСЯ БЭКУ ----
	// Фронт ТОЛЬКО валидирует и шлёт событие 'submit-form'. Success сам НЕ показывает.
	// Бэк: слушает 'submit-form' (form в e.detail.form) ИЛИ свой submit формы →
	//      шлёт AJAX → вызывает window.openSuccessModal() / window.openErrorModal().
	// (Опционально: можно задать window.backendFunc(form, e) — будет вызвана здесь.)
	if (typeof window.backendFunc === 'function') {
		window.backendFunc(form, e);
		return;
	}

	// Авто-success ВЫКЛЮЧЕН по умолчанию — success показывает бэк сам.
	// Для локального демо без бэка можно включить: window.LeRougeAutoSuccess = true
	if (window.LeRougeAutoSuccess !== true) return;

	// ---- ДЕМО (только при window.LeRougeAutoSuccess === true) ----
	const validator = form._formValidator;
	if (validator && typeof validator.clearForm === 'function') validator.clearForm();

	const currentModal = form.closest('.modal');
	if (currentModal) closeModal(currentModal, currentModal.getAttribute('data-modal') || undefined);

	setTimeout(() => loadModal('modals/success-modal.html'), 320);
});
