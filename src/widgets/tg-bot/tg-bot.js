// Parallax для tg-bot: при скролле фото движутся с разной скоростью

const initTgBotParallax = () => {
	const container = document.querySelector('.tg-bot [data-parallax]');
	if (!container) return;

	const photos = container.querySelectorAll('[data-parallax-speed]');
	if (!photos.length) return;

	// Сохраняем horizontal-offset для центрального фото (которое имеет translateX(-50%))
	const mainPhoto = container.querySelector('.tg-bot__photo--main');
	if (mainPhoto) {
		mainPhoto.style.setProperty('--parallax-x', '-50%');
	}

	let ticking = false;

	const update = () => {
		// На мобиле (≤768) параллакс выключен — центральное фото служит фоном секции
		if (window.innerWidth <= 768) {
			photos.forEach(photo => { photo.style.transform = ''; });
			ticking = false;
			return;
		}

		const rect = container.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		// progress 0..1, где 0.5 — центр секции на середине вьюпорта
		const total = viewportHeight + rect.height;
		const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / total));
		const offset = (progress - 0.5) * 2; // -1 ... +1

		photos.forEach(photo => {
			const speed = parseFloat(photo.dataset.parallaxSpeed) || 0;
			// Усиленный множитель — реально заметное движение
			const translateY = offset * speed * 240;
			const xVar = photo.style.getPropertyValue('--parallax-x') || '0px';
			photo.style.transform = `translate(${xVar}, ${translateY}px)`;
		});

		ticking = false;
	};

	const onScroll = () => {
		if (!ticking) {
			window.requestAnimationFrame(update);
			ticking = true;
		}
	};

	update();
	window.addEventListener('scroll', onScroll, { passive: true });
	window.addEventListener('resize', onScroll, { passive: true });
};

document.addEventListener('DOMContentLoaded', initTgBotParallax);
