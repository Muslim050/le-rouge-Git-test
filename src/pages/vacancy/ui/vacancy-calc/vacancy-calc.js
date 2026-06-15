function createCalculator(selector = '.vacancy-calc') {
	const root = document.querySelector(selector);
	if (!root) return;

	const weekElement = root.querySelector('.calc-week');
	const monthElement = root.querySelector('.calc-month');
	const yearElement = root.querySelector('.calc-year');
	const formatter = new Intl.NumberFormat('ru-RU');
	const format = value => formatter.format(Math.round(value));

	const readChecked = name => {
		const el = root.querySelector(`input[name="${name}"]:checked`);
		return el ? Number(el.value) : null;
	};

	let dayValue = readChecked('day') ?? 3;
	let langValue = readChecked('lang') ?? 1.1;
	let expValue = readChecked('exp') ?? 1.15;

	const update = () => {
		const base = 15500 * dayValue * langValue * expValue;
		if (weekElement) weekElement.textContent = format(base) + '₽';
		if (monthElement) monthElement.textContent = format(base * 4) + '₽';
		if (yearElement) yearElement.textContent = format(base * 52) + '₽';
	};

	root.querySelectorAll('.question').forEach(question => {
		question.querySelectorAll('label').forEach(label => {
			const input = label.querySelector('input');
			if (!input) return;

			input.addEventListener('change', e => {
				const target = e.target;

				switch (target.name) {
					case 'day':
						dayValue = Number(target.value);
						break;
					case 'lang':
						langValue = Number(target.value);
						break;
					default:
						expValue = Number(target.value);
				}

				update();

				const activeLabel = question.querySelector('label.active');
				if (activeLabel) activeLabel.classList.remove('active');
				if (target.checked) label.classList.add('active');
			});
		});
	});

	update();
}

document.addEventListener('DOMContentLoaded', () => {
	createCalculator();
});
