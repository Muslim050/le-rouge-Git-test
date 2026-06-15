import { initAccordion } from '@/shared/lib';

window.addEventListener('load', () => {
	const vacancyFaq = document.querySelector('.vacancy-faq');
	if (vacancyFaq) {
		setTimeout(() => {
			initAccordion(vacancyFaq);
		}, 200);
	}
});
