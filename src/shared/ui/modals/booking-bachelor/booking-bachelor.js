import { FormValidator } from '@/shared/lib/validation';

document.addEventListener('modal:mounted-booking-bachelor', e => {
	const modal = e.detail.modal;
	const form = modal.querySelector('.js-booking-bachelor');
	if (form) {
		new FormValidator(form);
	}

	// Активация pill-кнопок при выборе radio
	const pills = modal.querySelectorAll('.pill-group__item');
	pills.forEach(pill => {
		const input = pill.querySelector('input[type="radio"]');
		if (!input) return;

		input.addEventListener('change', () => {
			const groupName = input.name;
			modal
				.querySelectorAll(`.pill-group__item:has(input[name="${groupName}"])`)
				.forEach(p => p.classList.remove('is-active'));
			pill.classList.add('is-active');
		});
	});
});
