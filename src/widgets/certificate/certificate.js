// Сертификат: выбор номинала + поле «Своя сумма»

const formatRub = (digits) => {
	if (!digits) return '';
	return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
};

const initCertificate = () => {
	document.querySelectorAll('.certificate').forEach(section => {
		const pills = section.querySelectorAll('.certificate__pill');
		const input = section.querySelector('.certificate__amount-input');
		if (!pills.length || !input) return;

		// контекст для бэка + подзаголовок модалки: «номинал — вид» → data-object кнопки (читает modal.js)
		const submitBtn = section.querySelector('.certificate__submit');
		const typeInput = section.querySelector('[name="certificate-type"], .switch__input');
		const getType = () => (typeInput && typeInput.checked ? 'Напечатанный' : 'Электронный');
		const syncContext = () => {
			if (!submitBtn) return;
			const val = (input.value || '').trim();
			submitBtn.setAttribute('data-object', val ? `${val} — ${getType()}` : `Сертификат — ${getType()}`);
		};
		typeInput?.addEventListener('change', syncContext);

		pills.forEach(pill => {
			pill.addEventListener('click', () => {
				pills.forEach(p => p.classList.remove('is-active'));
				pill.classList.add('is-active');

				if (pill.classList.contains('certificate__pill--custom')) {
					// «Своя сумма» — даём редактировать
					input.removeAttribute('readonly');
					input.value = '';
					input.focus();
				} else {
					// фиксированный номинал — берём сумму из текста/data
					input.setAttribute('readonly', '');
					input.value = pill.dataset.value || pill.textContent.trim();
				}
				syncContext();
			});
		});

		// Форматируем ввод суммы пробелами + ₽ в режиме «Своя сумма»
		input.addEventListener('input', () => {
			if (!input.hasAttribute('readonly')) {
				const digits = input.value.replace(/\D/g, '');
				input.value = formatRub(digits);
			}
			syncContext();
		});

		syncContext();
	});
};

document.addEventListener('DOMContentLoaded', initCertificate);
