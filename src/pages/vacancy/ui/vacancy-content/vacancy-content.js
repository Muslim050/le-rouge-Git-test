import { initAccordion } from '@/shared/lib';

window.addEventListener('load', () => {
	const vacancyContent = document.querySelector('.vacancy-content');
	if (vacancyContent) {
		setTimeout(() => {
			initAccordion(vacancyContent);
		}, 200);
	}
});
