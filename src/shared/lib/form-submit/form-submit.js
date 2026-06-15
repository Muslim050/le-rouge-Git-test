// Обработчик отправки формы
import { dispatch } from '../dom/dispatch.js';
import { loadModal } from '../../ui/modal/modal.js';

// Обработчик события submit-form
document.addEventListener('submit-form', async (event) => {
	const { form } = event.detail;

	if (!form) {
		console.error('Форма не найдена в событии submit-form');
		return;
	}

	// Проверяем, что form является HTML элементом формы
	if (!(form instanceof HTMLFormElement)) {
		console.error('Переданный элемент не является HTMLFormElement');
		return;
	}

	if (typeof backendFunc === 'function') {

		backendFunc(form, event);

	} else {

		// Проверяем, находится ли форма внутри модального окна
		const parentModal = form.closest('.modal');
		const modalName = parentModal ? parentModal.getAttribute('data-modal') : null;

		// Очищаем форму через экземпляр FormValidator
		if (form._formValidator && typeof form._formValidator.clearForm === 'function') {
			form._formValidator.clearForm();
		} else {
			console.warn('FormValidator не найден для формы. Убедитесь, что форма инициализирована через new FormValidator(form)');
		}

		// Если форма внутри модального окна - закрываем его
		if (parentModal && modalName) {
			dispatch({
				el: document,
				name: `modal:close-${modalName}`,
				detail: { modal: parentModal }
			});

			// Закрываем модальное окно программно
			parentModal.classList.remove('active');

			// Восстанавливаем скролл через небольшую задержку
			setTimeout(() => {
				document.body.style.overflow = '';
				document.body.style.paddingRight = '0px';

				const header = document.querySelector('.header');
				if (header) {
					header.style.paddingRight = '0px';
					header.classList.remove('modal-open');
				}
			}, 300);
		}

		// Показываем модальное окно с благодарностью
		// Добавляем небольшую задержку, чтобы модалка успела закрыться
		setTimeout(() => {
			loadModal('modals/success-modal.html');
		}, parentModal ? 350 : 0);
	}

	// Диспатчим событие для уведомления других модулей об успешной отправке
	dispatch({
		el: form,
		name: 'form-submitted',
		detail: { form }
	});
});

