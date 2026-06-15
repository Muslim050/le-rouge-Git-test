import IMask from 'imask';

export const initInputMask = (scope = document) => {
	scope.querySelectorAll('.input__valid-phone').forEach(el => {
		IMask(el, {
			mask: '+7 (000) 000-00-00'
		});
	});

	// Дата — ДД.ММ.ГГГГ
	scope.querySelectorAll('.input__valid-date').forEach(el => {
		IMask(el, {
			mask: '00.00.0000'
		});
	});
};
