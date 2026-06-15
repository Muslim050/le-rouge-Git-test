function initExpandable(options = {}) {
	const { accordion = false, selector = '.expandable-list' } = options;
	const expandableLists = document.querySelectorAll(selector);
	const MOBILE_BREAKPOINT = 991;

	if (!expandableLists.length) return;

	expandableLists.forEach(list => {
		const items = list.querySelectorAll('.expandable-item');

		items.forEach(item => {
			const trigger = item.querySelector('.expandable-trigger');
			const body = item.querySelector('.expandable-body');

			if (!trigger || !body) return;

			// Устанавливаем начальную высоту для активных элементов
			if (item.classList.contains('active')) {
				body.style.maxHeight = body.scrollHeight + 'px';
			}

			trigger.addEventListener('click', () => {
				const isActive = item.classList.contains('active');
				const currentIsMobile = window.innerWidth <= MOBILE_BREAKPOINT;

				if (accordion) {
					// Закрываем все остальные элементы в этом списке
					items.forEach(otherItem => {
						if (otherItem !== item) {
							const otherBody = otherItem.querySelector('.expandable-body');
							otherItem.classList.remove('active');
							if (otherBody) {
								otherBody.style.maxHeight = '0px';
							}
						}
					});
				}

				// Переключаем состояние текущего элемента
				if (isActive) {
					body.style.maxHeight = '0px';
					item.classList.remove('active');
				} else {
					item.classList.add('active');
					// Используем scrollHeight для точного вычисления высоты
					body.style.maxHeight = body.scrollHeight + 'px';

					// Плавный скролл к открытому элементу на мобилке
					// Ждём завершения анимации открытия (CSS transition теперь 0.7s)
					if (currentIsMobile) {
						setTimeout(() => {
							const header = document.querySelector('.header');
							const headerHeight = header ? header.offsetHeight : 0;
							const additionalOffset = 20;
							const totalOffset = headerHeight + additionalOffset;

							const elementPosition = item.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

							window.scrollTo({
								top: offsetPosition,
								behavior: 'smooth'
							});
						}, 700);
					}
				}
			});

			// Обновляем высоту при изменении размера окна
			const resizeObserver = new ResizeObserver(() => {
				if (item.classList.contains('active')) {
					body.style.maxHeight = body.scrollHeight + 'px';
				}
			});

			resizeObserver.observe(body);
		});
	});
}

function initMobExpandable() {
	const MOBILE_BREAKPOINT = 991;
	let isInitialized = false;
	let eventListeners = [];

	const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

	const destroyExpandable = () => {
		// Удаляем все обработчики событий
		eventListeners.forEach(({ trigger, handler }) => {
			trigger.removeEventListener('click', handler);
		});
		eventListeners = [];

		// Удаляем класс active со всех элементов
		const expandableLists = document.querySelectorAll('.expandable-list-mob');
		expandableLists.forEach(list => {
			const items = list.querySelectorAll('.expandable-item-mob');
			items.forEach(item => {
				item.classList.remove('active');
			});
		});

		isInitialized = false;
	};

	const initExpandableItems = () => {
		const expandableLists = document.querySelectorAll('.expandable-list-mob');

		if (!expandableLists.length) return;

		expandableLists.forEach(list => {
			const items = list.querySelectorAll('.expandable-item-mob');

			items.forEach(item => {
				const trigger = item.querySelector('.expandable-trigger-mob');
				const body = item.querySelector('.expandable-body-mob');

				if (!trigger || !body) return;

				// Устанавливаем начальную высоту для активных элементов
				if (item.classList.contains('active')) {
					body.style.maxHeight = body.scrollHeight + 'px';
				}

				const handler = () => {
					const isActive = item.classList.contains('active');

					if (isActive) {
						body.style.maxHeight = '0px';
						item.classList.remove('active');
					} else {
						item.classList.add('active');
						body.style.maxHeight = body.scrollHeight + 'px';

						// Плавный скролл к открытому элементу
						// Ждём завершения анимации открытия (CSS transition теперь 0.8s)
						setTimeout(() => {
							const header = document.querySelector('.header');
							const headerHeight = header ? header.offsetHeight : 0;
							const additionalOffset = 20;
							const totalOffset = headerHeight + additionalOffset;

							const elementPosition = item.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

							window.scrollTo({
								top: offsetPosition,
								behavior: 'smooth'
							});
						}, 800);
					}
				};

				trigger.addEventListener('click', handler);

				// Обновляем высоту при изменении размера окна
				const resizeObserver = new ResizeObserver(() => {
					if (item.classList.contains('active')) {
						body.style.maxHeight = body.scrollHeight + 'px';
					}
				});

				resizeObserver.observe(body);

				// Сохраняем ссылку на обработчик для последующего удаления
				eventListeners.push({ trigger, handler, resizeObserver });
			});
		});

		isInitialized = true;
	};

	const handleResize = () => {
		if (isMobile() && !isInitialized) {
			initExpandableItems();
		} else if (!isMobile() && isInitialized) {
			destroyExpandable();
		}
	};

	// Инициализация при загрузке
	if (isMobile()) {
		initExpandableItems();
	}

	// Слушаем ресайз окна
	window.addEventListener('resize', handleResize);
}

export { initExpandable, initMobExpandable };

