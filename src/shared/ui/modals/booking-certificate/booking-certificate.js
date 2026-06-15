import { FormValidator } from '@/shared/lib/validation';

document.addEventListener('modal:mounted-booking-certificate', e => {
	const modal = e.detail.modal;
	const form = modal.querySelector('.js-booking-certificate');
	if (form) {
		new FormValidator(form);
	}
});
