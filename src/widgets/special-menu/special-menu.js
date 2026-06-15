// Special-menu: клик по слову → кружок появляется в позиции слова, X закрывает

const initSpecialMenu = () => {
	const root = document.querySelector('.special-menu');
	if (!root) return;

	const cloud = root.querySelector('.special-menu__cloud');
	const hints = root.querySelectorAll('.special-menu__hint');
	const bubble = root.querySelector('.special-menu__bubble');
	const bubbleImg = bubble?.querySelector('.special-menu__bubble-img');
	const closeBtn = root.querySelector('.special-menu__bubble-close');
	if (!cloud || !bubble || !hints.length) return;

	const showBubble = (hint) => {
		const cloudRect = cloud.getBoundingClientRect();
		const hintRect = hint.getBoundingClientRect();
		// Центр слова относительно cloud-контейнера
		let cx = hintRect.left + hintRect.width / 2 - cloudRect.left;
		let cy = hintRect.top + hintRect.height / 2 - cloudRect.top;

		// Картинка кружка — из data-img выбранного слова
		if (bubbleImg && hint.dataset.img) bubbleImg.src = hint.dataset.img;

		// Удерживаем кружок в пределах сцены — иначе у крайних слов
		// (напр. «расслабление» справа) он уезжал за край. Кружок центрируется
		// на точке через translate(-50%,-50%), поэтому зажимаем центр на пол-радиуса.
		const halfW = bubble.offsetWidth / 2;
		const halfH = bubble.offsetHeight / 2;
		const pad = 4;
		cx = Math.max(halfW + pad, Math.min(cx, cloudRect.width - halfW - pad));
		cy = Math.max(halfH + pad, Math.min(cy, cloudRect.height - halfH - pad));

		bubble.style.left = `${cx}px`;
		bubble.style.top = `${cy}px`;
		bubble.classList.remove('is-hidden');
		bubble.setAttribute('aria-hidden', 'false');
	};

	const hideBubble = () => {
		bubble.classList.add('is-hidden');
		bubble.setAttribute('aria-hidden', 'true');
	};

	hints.forEach(hint => {
		hint.addEventListener('click', () => showBubble(hint));
	});

	closeBtn?.addEventListener('click', hideBubble);

	// Esc закрывает
	document.addEventListener('keydown', e => {
		if (e.key === 'Escape' && !bubble.classList.contains('is-hidden')) hideBubble();
	});
};

document.addEventListener('DOMContentLoaded', initSpecialMenu);
