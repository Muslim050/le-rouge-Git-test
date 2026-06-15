// events-form: валидация (UI-kit), табы (budget/guests), «Своя сумма»,
// динамический текст кнопки «ОРГАНИЗОВАТЬ + выбранное мероприятие».

import { FormValidator } from '@/shared/lib/validation';

const initEventsForm = () => {
	const form = document.querySelector('.js-events-form');
	if (!form) return;

	// Валидация UI-kit: инициализирует кастом-селект, маски (телефон/дата) и проверку полей
	new FormValidator(form);

	// ---------- табы (budget / guests) ----------
	form.querySelectorAll('[data-pills]').forEach(group => {
		const tabs = group.querySelectorAll('.events-form__tab');
		const groupName = group.dataset.pills; // 'budget' | 'guests'
		const hidden = form.querySelector(`input[name="${groupName}"]`);
		const customInput = groupName === 'budget' ? form.querySelector('.events-form__custom') : null;
		const customGroup = customInput?.closest('.form-group');

		tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				tabs.forEach(t => t.classList.remove('is-active'));
				tab.classList.add('is-active');

				if (hidden) hidden.value = tab.dataset.value;

				if (customGroup) {
					const isCustom = tab.dataset.value === 'custom';
					customGroup.classList.toggle('is-visible', isCustom);
					if (isCustom) setTimeout(() => customInput.focus(), 50);
				}
			});
		});
	});

	// ---------- авто-форматирование «Своя сумма» ----------
	const customInput = form.querySelector('.events-form__custom');
	customInput?.addEventListener('input', e => {
		const digits = e.target.value.replace(/\D/g, '');
		e.target.value = digits ? `${parseInt(digits, 10).toLocaleString('ru-RU')} ₽` : '';
	});

	// ---------- кнопка: «организовать + выбранное мероприятие» ----------
	const submitText = form.querySelector('.events-form__submit-text');
	const eventSelect = form.querySelector('.js-event-select');
	if (submitText && eventSelect) {
		eventSelect.querySelectorAll('.custom-select__option').forEach(option => {
			option.addEventListener('click', () => {
				const label = option.querySelector('.custom-select__option-text')?.textContent.trim();
				submitText.textContent = label ? `организовать ${label}` : 'организовать праздник';
			});
		});
	}

	// ---------- submit → единый конвейер форм ----------
	form.addEventListener('submit', e => {
		e.preventDefault();
		document.dispatchEvent(new CustomEvent('submit-form', { detail: { form } }));
	});
};

document.addEventListener('DOMContentLoaded', initEventsForm);
