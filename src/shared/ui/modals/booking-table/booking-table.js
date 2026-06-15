import { FormValidator } from '@/shared/lib/validation';

document.addEventListener('modal:mounted-booking-table', e => {
	const modal = e.detail.modal;
	const form = modal.querySelector('.js-booking-table');
	if (!form) return;

	new FormValidator(form);
});
