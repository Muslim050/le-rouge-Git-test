// Sticky-expand: при скролле через секцию фото плавно растёт до fullscreen

const initHallExpand = () => {
	const wrappers = document.querySelectorAll('[data-hall-expand]');

	wrappers.forEach(wrapper => {
		const photo = wrapper.querySelector('.hall__expand-photo');
		if (!photo) return;

		const startW = photo.offsetWidth;
		const startH = photo.offsetHeight;

		let ticking = false;

		const update = () => {
			// На мобиле (≤768) раскрытия нет — фото статичное, чистим inline-стили
			if (window.innerWidth <= 768) {
				photo.style.width = '';
				photo.style.height = '';
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

			photo.style.width = `${w}px`;
			photo.style.height = `${h}px`;

			// border-radius НЕ трогаем в JS (как в show-video): держим rem(16) и снимаем
			// только в конце через класс is-expanded + CSS-transition — иначе при скролле
			// радиус «плывёт» каждый кадр и выглядит странно.
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

document.addEventListener('DOMContentLoaded', initHallExpand);

// Оживляем кастомный селект «Стол №» (он вне формы, поэтому FormValidator его не трогает).
// Открытие/выбор/закрытие. При выборе шлём 'change' — его слушает initHallTableContext ниже.
const initHallSelect = () => {
	document.querySelectorAll('.hall__plan-select .custom-select').forEach(select => {
		// Защита от ДВОЙНОЙ инициализации: на бою бандл может быть подключён дважды
		// (Bitrix-combined template JS + отдельный main.js). Без флага на инпут вешаются
		// два click-обработчика, и они гасят is-open друг друга (первый ставит, второй,
		// видя wasOpen=true, снимает) → селект не открывается. Флаг на DOM общий для обоих
		// бандлов, поэтому второй инстанс пропускает уже инициализированный селект.
		if (select.dataset.hallSelectReady) return;
		select.dataset.hallSelectReady = '1';

		const input = select.querySelector('.custom-select__input');
		const dropdown = select.querySelector('.custom-select__dropdown');
		const options = select.querySelectorAll('.custom-select__option');
		if (!input || !dropdown) return;

		dropdown.addEventListener('click', e => e.stopPropagation());

		// не давать фокус-курсор на readonly-инпут
		input.addEventListener('focus', e => {
			e.preventDefault();
			input.blur();
		});

		input.addEventListener('click', e => {
			e.stopPropagation();
			const wasOpen = select.classList.contains('is-open');
			document
				.querySelectorAll('.custom-select.is-open')
				.forEach(s => s.classList.remove('is-open', 'is-open-top'));

			if (wasOpen) return;

			// открыть вверх, если снизу не помещается
			const rect = select.getBoundingClientRect();
			const dh = dropdown.scrollHeight || 300;
			select.classList.toggle('is-open-top', window.innerHeight - rect.bottom < dh && rect.top > dh);
			select.classList.add('is-open');
		});

		options.forEach(option => {
			option.addEventListener('click', e => {
				e.stopPropagation();
				options.forEach(o => o.classList.remove('is-selected'));
				option.classList.add('is-selected');
				input.value = option.querySelector('.custom-select__option-text').textContent;
				input.setAttribute('data-value', option.dataset.value || '');
				select.classList.remove('is-open', 'is-open-top');
				input.dispatchEvent(new Event('change', { bubbles: true }));
			});
		});
	});

	// закрытие по клику вне селекта
	if (!document._hallSelectOutsideHandler) {
		document.addEventListener('click', () => {
			document
				.querySelectorAll('.hall__plan-select .custom-select.is-open')
				.forEach(s => s.classList.remove('is-open', 'is-open-top'));
		});
		document._hallSelectOutsideHandler = true;
	}
};

document.addEventListener('DOMContentLoaded', initHallSelect);

// Контекст для бэка: выбранный стол → в data-object кнопки брони (читает modal.js)
const initHallTableContext = () => {
	document.querySelectorAll('.hall__plan-block').forEach(block => {
		const input = block.querySelector('.hall__plan-select input');
		const btn = block.querySelector('.hall__plan-btn');
		if (!input || !btn) return;
		const sync = () => {
			const val = (input.value || '').trim();
			// чистый ярлык стола → в модалку (span[data-object-text]) и в hidden object для бэка
			btn.setAttribute('data-object', val);
		};
		input.addEventListener('change', sync);
		input.addEventListener('input', sync);
		sync();
	});
};

document.addEventListener('DOMContentLoaded', initHallTableContext);
