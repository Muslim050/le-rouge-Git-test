import { FormValidator } from '@/shared/lib/validation';

const vacancyForm = document.querySelector('.vacancy-form');
if (vacancyForm) {
	const form = vacancyForm.querySelector('.form');
	new FormValidator(form);
}
