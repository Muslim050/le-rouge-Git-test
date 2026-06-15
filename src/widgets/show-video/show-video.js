const initShowVideoExpand = () => {
	const wrappers = document.querySelectorAll('[data-video-expand]');

	wrappers.forEach(wrapper => {
		const media = wrapper.querySelector('.show-video__expand-media');
		if (!media) return;

		const startW = media.offsetWidth;
		const startH = media.offsetHeight;

		let ticking = false;

		const update = () => {
			// На мобиле (≤768) раскрытия нет — фото статичное, чистим inline-стили
			if (window.innerWidth <= 768) {
				media.style.width = '';
				media.style.height = '';
				wrapper.classList.remove('is-expanded');
				ticking = false;
				return;
			}

			const rect = wrapper.getBoundingClientRect();
			const total = rect.height - window.innerHeight;
			const progress = Math.max(0, Math.min(1, -rect.top / total));

			const targetW = window.innerWidth;
			const targetH = window.innerHeight;

			const w = startW + (targetW - startW) * progress;
			const h = startH + (targetH - startH) * progress;

			media.style.width = `${w}px`;
			media.style.height = `${h}px`;

			wrapper.classList.toggle('is-expanded', progress >= 0.95);

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
	});
};

document.addEventListener('DOMContentLoaded', initShowVideoExpand);
