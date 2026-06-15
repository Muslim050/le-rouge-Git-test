import { dispatch } from '../dom/dispatch.js';
import { toggleClass } from '../dom/toggle-class.js';

import { buildValidationRules } from './build-validation-rules.js';
import { initInputMask } from './inputs-mask.js';

export class FormValidator {
	constructor(form) {
		if (!(form instanceof HTMLFormElement)) {
			console.error('FormValidator: переданный элемент не является формой', form);
			throw new Error('FormValidator требует HTMLFormElement');
		}

		this.form = form;
		this.rules = buildValidationRules(form);

		// Сохраняем ссылку на валидатор в элементе формы
		form._formValidator = this;

		this.init();
	}

	init() {
		initInputMask(this.form);
		this.initCustomSelects();
		this.initFileInputs();

		const inputs = this.form.querySelectorAll('.input');

		inputs.forEach(input => {
			input.addEventListener('blur', () => {
				// Получаем значение поля
				const value = this.getValue(input);

				// Если поле пустое, не показываем ошибку валидации
				// Только обновляем состояние кнопки
				if (!value) {
					// Убираем ошибку, если она была показана ранее
					const formGroup = input.closest('.form-group');
					if (formGroup) {
						formGroup.classList.remove('error', 'success');
						const errorElement = formGroup.querySelector('.input__error');
						if (errorElement) {
							errorElement.remove();
						}
					}
					this.updateSubmitButton();
					return;
				}

				// Если поле заполнено - выполняем валидацию
				this.rules.forEach(({ inputsList, type, validator, errorMessage }) => {
					const currentInput = [...inputsList].find(i => {
						return i.className === input.className;
					});
					if (currentInput) {
						this.validateInput(currentInput, type, validator, errorMessage);
					}
				});
 				// Проверяем валидность формы после потери фокуса
				this.updateSubmitButton();
			});

			// Проверяем валидность формы при вводе текста
			input.addEventListener('input', () => {
				this.updateSubmitButton();
			});

			// Для чекбоксов отслеживаем событие change
			if (input.type === 'checkbox') {
				input.addEventListener('change', () => {
					this.updateSubmitButton();
				});
			}
		});

		const submitBtn = this.form.querySelector(".btn[type='submit']");

		if (!submitBtn) return;

		// Изначально проверяем валидность формы
		this.updateSubmitButton();

		submitBtn.addEventListener('click', e => {
			e.preventDefault();
			const isValid = this.validate();

			if (!isValid) {
				console.log('Валидация не пройдена');
				return;
			}

			console.log('Валидация пройдена');

			// Отправляем событие с данными формы
			// Обработчик этого события должен отправить данные на сервер
			// и очистить форму после успешной отправки
			dispatch({
				el: document,
				name: 'submit-form',
				detail: { isValid: true, form: this.form }
			});
		});
	}

	initCustomSelects() {
		const selects = this.form.querySelectorAll('.custom-select');

		selects.forEach(select => {
			const input = select.querySelector('.custom-select__input');
			const dropdown = select.querySelector('.custom-select__dropdown');
			const options = select.querySelectorAll('.custom-select__option');

			// Предотвращаем всплытие кликов только на дропдауне и опциях
			if (dropdown) {
				dropdown.addEventListener('click', (e) => {
					e.stopPropagation();
				});
			}

		// Открытие/закрытие селекта
		input.addEventListener('click', () => {
			const wasOpen = select.classList.contains('is-open');

			// Закрываем все остальные селекты
			this.closeAllSelects(select);

			// Переключаем состояние текущего селекта
			if (!wasOpen) {
				// Определяем направление открытия
				this.updateSelectDirection(select);
				select.classList.add('is-open');
				// Помечаем селект как только что открытый, чтобы он не закрылся сразу
				select._justOpened = true;
			} else {
				select.classList.remove('is-open', 'is-open-top');
			}
		});

			// Выбор опции
			options.forEach(option => {
				option.addEventListener('click', (e) => {
					e.stopPropagation();

					// Снимаем выделение со всех опций
					options.forEach(opt => opt.classList.remove('is-selected'));

					// Выделяем выбранную опцию
					option.classList.add('is-selected');

					// Устанавливаем значение в input
					const value = option.dataset.value;
					input.value = option.querySelector('.custom-select__option-text').textContent;
					input.setAttribute('data-value', value);

					// Удаляем ошибку при выборе
					if (select.classList.contains('error')) {
						select.classList.remove('error');
						const errorElement = select.querySelector('.input__error');
						if (errorElement) {
							errorElement.remove();
						}
					}

					// Обновляем состояние кнопки отправки
					this.updateSubmitButton();

					// Закрываем селект
					select.classList.remove('is-open', 'is-open-top');
				});
			});

			// Предотвращаем фокус на input
			input.addEventListener('focus', (e) => {
				e.preventDefault();
				input.blur();
			});
		});

		// Убедимся, что обработчик закрытия селектов добавлен только один раз
		if (!document._customSelectClickHandlerAdded) {
			document.addEventListener('click', () => {
				document.querySelectorAll('.custom-select.is-open').forEach(select => {
					// Не закрываем селект, который только что был открыт
					if (select._justOpened) {
						select._justOpened = false;
						return;
					}
					select.classList.remove('is-open', 'is-open-top');
				});
			});
			document._customSelectClickHandlerAdded = true;
		}

		// Обновление направления при скролле или ресайзе
		window.addEventListener('scroll', () => {
			selects.forEach(select => {
				if (select.classList.contains('is-open')) {
					this.updateSelectDirection(select);
				}
			});
		}, true);

		window.addEventListener('resize', () => {
			selects.forEach(select => {
				if (select.classList.contains('is-open')) {
					this.updateSelectDirection(select);
				}
			});
		});
	}

	updateSelectDirection(select) {
		const dropdown = select.querySelector('.custom-select__dropdown');
		if (!dropdown) return;

		const rect = select.getBoundingClientRect();
		const dropdownHeight = dropdown.scrollHeight || 300; // Используем максимальную высоту если дропдаун еще не отрендерен
		const spaceBelow = window.innerHeight - rect.bottom;
		const spaceAbove = rect.top;

		// Если снизу недостаточно места, но сверху достаточно - открываем вверх
		if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
			select.classList.add('is-open-top');
		} else {
			select.classList.remove('is-open-top');
		}
	}

	closeAllSelects(exceptSelect = null) {
		const selects = this.form.querySelectorAll('.custom-select');
		selects.forEach(select => {
			if (select !== exceptSelect) {
				select.classList.remove('is-open');
			}
		});
	}

	initFileInputs() {
		const fileInputs = this.form.querySelectorAll('input[type="file"]');

		fileInputs.forEach(input => {
			const formGroup = input.closest('.form-group');
			if (!formGroup) return;

			const uploadArea = formGroup.querySelector('.file-upload-area');
			const uploadLink = formGroup.querySelector('.file-upload-area__link');
			const hint = formGroup.querySelector('.file-upload-hint');

			if (!uploadArea) return;

			// Клик по области или ссылке открывает диалог выбора файла
			const openFileDialog = (e) => {
				// Игнорируем клик по кнопке удаления
				if (e.target.closest('.file-upload-area__remove')) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				input.click();
			};

			uploadArea.addEventListener('click', openFileDialog);
			if (uploadLink) {
				uploadLink.addEventListener('click', openFileDialog);
			}

			// Обработка выбора файла
			input.addEventListener('change', (e) => {
				const file = e.target.files[0];
				if (file) {
					if (this.validateFile(file, formGroup)) {
						this.displaySelectedFile(formGroup, file);
					} else {
						// Очищаем input если файл невалиден
						input.value = '';
					}
				}
			});

			// Drag and drop
			uploadArea.addEventListener('dragover', (e) => {
				e.preventDefault();
				e.stopPropagation();
				uploadArea.style.backgroundColor = 'rgba(222, 233, 243, 0.5)';
			});

			uploadArea.addEventListener('dragleave', (e) => {
				e.preventDefault();
				e.stopPropagation();
				uploadArea.style.backgroundColor = '';
			});

			uploadArea.addEventListener('drop', (e) => {
				e.preventDefault();
				e.stopPropagation();
				uploadArea.style.backgroundColor = '';

				const files = e.dataTransfer.files;
				if (files.length > 0) {
					const file = files[0];

					if (this.validateFile(file, formGroup)) {
						// Присваиваем файл инпуту
						const dataTransfer = new DataTransfer();
						dataTransfer.items.add(file);
						input.files = dataTransfer.files;

						this.displaySelectedFile(formGroup, file);
					}
				}
			});
		});
	}

	displaySelectedFile(formGroup, file) {
		const uploadArea = formGroup.querySelector('.file-upload-area');
		const uploadText = formGroup.querySelector('.file-upload-area__text');
		const uploadLink = formGroup.querySelector('.file-upload-area__link');
		const uploadIcon = formGroup.querySelector('.file-upload-area__icon');
		const removeBtn = formGroup.querySelector('.file-upload-area__remove');
		const input = formGroup.querySelector('input[type="file"]');

		if (!uploadArea || !uploadText) return;

		// Сохраняем исходный текст, если еще не сохранен
		if (!uploadArea.dataset.originalText) {
			uploadArea.dataset.originalText = uploadText.innerHTML;
		}

		// Меняем текст на название файла
		uploadText.textContent = file.name;

		// Добавляем класс для изменения стилов
		uploadArea.classList.add('has-file');

		// Показываем кнопку удаления
		if (removeBtn) {
			removeBtn.style.display = 'flex';

			// Удаляем предыдущий обработчик, если был
			const newRemoveBtn = removeBtn.cloneNode(true);
			removeBtn.parentNode.replaceChild(newRemoveBtn, removeBtn);

			// Добавляем новый обработчик удаления
			newRemoveBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();

				// Очищаем input
				input.value = '';

				// Восстанавливаем исходный вид
				uploadText.innerHTML = uploadArea.dataset.originalText;
				uploadArea.classList.remove('has-file');
				newRemoveBtn.style.display = 'none';

				// Очищаем ошибку валидации, если была
				this.clearFileError(formGroup);

				// Диспатчим событие change для обновления корзины
				input.dispatchEvent(new Event('change', { bubbles: true }));
			});
		}
	}

	validateFile(file, formGroup) {
		// Получаем input элемент из formGroup
		const input = formGroup.querySelector('input[type="file"]');

		// Читаем параметры из data-атрибутов или используем значения по умолчанию (100 МБ, все типы)
		const maxSizeMB = input && input.dataset.maxSize ? parseInt(input.dataset.maxSize) : 100;
		const maxSize = maxSizeMB * 1024 * 1024; // Конвертируем МБ в байты

		// Читаем разрешенные типы из data-атрибута
		const allowedTypesStr = input && input.dataset.allowedTypes ? input.dataset.allowedTypes : 'pdf,doc,docx,xls,xlsx';
		const allowedExtensionsArray = allowedTypesStr.split(',').map(ext => `.${ext.trim()}`);

		// Карта расширений к MIME типам
		const mimeTypeMap = {
			'.pdf': 'application/pdf',
			'.doc': 'application/msword',
			'.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'.xls': 'application/vnd.ms-excel',
			'.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		};

		// Формируем массив разрешенных MIME типов
		const allowedTypes = allowedExtensionsArray
			.map(ext => mimeTypeMap[ext])
			.filter(type => type !== undefined);

		// Проверка размера
		if (file.size > maxSize) {
			this.showFileError(formGroup, `Размер файла не должен превышать ${maxSizeMB} МБ`);
			return false;
		}

		// Проверка типа по MIME и расширению
		const fileName = file.name.toLowerCase();
		const hasValidExtension = allowedExtensionsArray.some(ext => fileName.endsWith(ext));
		const hasValidType = allowedTypes.includes(file.type);

		if (!hasValidExtension && !hasValidType) {
			// Формируем список разрешенных форматов для сообщения об ошибке
			const formatsStr = allowedTypesStr.toUpperCase().split(',').join(', ');
			this.showFileError(formGroup, `Разрешены только файлы форматов: ${formatsStr}`);
			return false;
		}

		// Удаляем ошибку, если файл валиден
		this.clearFileError(formGroup);
		return true;
	}

	showFileError(formGroup, errorMessage) {
		if (!formGroup) return;

		// Удаляем предыдущую ошибку, если есть
		let errorElement = formGroup.querySelector('.input__error');

		if (!errorElement) {
			errorElement = document.createElement('p');
			errorElement.classList.add('input__error');
			formGroup.appendChild(errorElement);
		}

		errorElement.textContent = errorMessage;
		formGroup.classList.add('error');
		formGroup.classList.remove('success');
	}

	clearFileError(formGroup) {
		if (!formGroup) return;

		const errorElement = formGroup.querySelector('.input__error');
		if (errorElement) {
			errorElement.remove();
		}

		formGroup.classList.remove('error');
	}

	validate() {
		let isFormValid = true;

		// Валидация обычных полей
		this.rules.forEach(({ inputsList, type, validator, errorMessage }) => {
			inputsList.forEach(input => {
				const valid = this.validateInput(input, type, validator, errorMessage);

				if (!valid) {
					isFormValid = false;
				}
			});
		});

		// Валидация кастомных селектов
		const customSelects = this.form.querySelectorAll('.custom-select[data-required="true"]');
		customSelects.forEach(select => {
			const valid = this.validateCustomSelect(select);
			if (!valid) {
				isFormValid = false;
			}
		});

		return isFormValid;
	}

	validateCustomSelect(selectElement) {
		const input = selectElement.querySelector('.custom-select__input');
		const isRequired = selectElement.dataset.required === 'true';

		if (isRequired && !input.value.trim()) {
			selectElement.classList.add('error');

			// Добавляем сообщение об ошибке, если его еще нет
			if (!selectElement.querySelector('.input__error')) {
				const errorElement = document.createElement('div');
				errorElement.className = 'input__error';
				errorElement.textContent = 'Это поле обязательно для заполнения';
				selectElement.appendChild(errorElement);
			}

			return false;
		} else {
			selectElement.classList.remove('error');
			const errorElement = selectElement.querySelector('.input__error');
			if (errorElement) {
				errorElement.remove();
			}
			return true;
		}
	}

	validateInput(input, type, validator, errorMessage = '') {
		if (type === 'checkbox') {
			if (input instanceof HTMLInputElement && input.type === 'checkbox') {
				const isValid = input.checked;
				return this.setFeedback(input, isValid, isValid ? '' : errorMessage);
			}

			return this.setFeedback(input, false, errorMessage);
		}

		const value = this.getValue(input);
		const isValid = Boolean(value && validator && validator(value));

		return this.setFeedback(input, isValid, isValid ? '' : errorMessage);
	}

	getValue(input) {
		if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
			return input.value.trim();
		}

		return String(input.value || '').trim();
	}

	setFeedback(input, isValid, errorMessage = '') {
		const formGroup = input.closest('.form-group');

		if (!formGroup) {
			console.warn('Form group not found for input:', input);
			return isValid;
		}

		let errorElement = formGroup.querySelector('.input__error');

		if (!isValid && errorMessage) {
			if (!errorElement) {
				errorElement = document.createElement('p');
				errorElement.classList.add('input__error');
				formGroup.appendChild(errorElement);
			}
			errorElement.textContent = errorMessage;
		} else {
			if (errorElement) errorElement.remove();
		}

		toggleClass(formGroup, isValid ? 'success' : 'error', isValid ? 'error' : 'success');

		return isValid;
	}

	clearForm() {
		// Очищаем все текстовые поля и поля ввода
		this.form.querySelectorAll('input, input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea').forEach(input => {
			// Проверяем наличие маски IMask
			if (input.maskRef && typeof input.maskRef.unmaskedValue !== 'undefined') {
				// Очищаем маску IMask
				input.maskRef.unmaskedValue = '';
				input.maskRef.value = '';
				console.log('Маска очищена через maskRef');
			} else {
				// Обычная очистка для полей без маски
				input.value = '';
			}
		});

		// Очищаем чекбоксы (включая мультичекбоксы)
		this.form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
			checkbox.checked = false;

			// Сбрасываем промежуточное состояние для главных чекбоксов
			if (checkbox.hasAttribute('data-checkbox-all')) {
				checkbox.indeterminate = false;
				checkbox.setAttribute('data-indeterminate', 'false');
			}
		});

		// Очищаем кастомные селекты
		this.form.querySelectorAll('.custom-select').forEach(select => {
			const input = select.querySelector('.custom-select__input');
			if (input) {
				input.value = '';
				input.removeAttribute('data-value');
			}
			// Снимаем выделение со всех опций
			const options = select.querySelectorAll('.custom-select__option');
			options.forEach(opt => opt.classList.remove('is-selected'));
			// Закрываем дропдаун
			select.classList.remove('is-open');
		});

		// Очищаем файловые инпуты и их визуальное представление
		this.form.querySelectorAll('input[type="file"]').forEach(fileInput => {
			fileInput.value = '';

			const formGroup = fileInput.closest('.form-group');
			if (formGroup) {
				// Очищаем старое визуальное представление (если оно есть)
				const fileInfo = formGroup.querySelector('.file-upload-selected');
				if (fileInfo) {
					fileInfo.remove();
				}

				// Восстанавливаем исходный вид file-upload-area
				const uploadArea = formGroup.querySelector('.file-upload-area');
				if (uploadArea) {
					const uploadText = uploadArea.querySelector('.file-upload-area__text');
					const removeBtn = uploadArea.querySelector('.file-upload-area__remove');

					// Восстанавливаем исходный текст
					if (uploadText && uploadArea.dataset.originalText) {
						uploadText.innerHTML = uploadArea.dataset.originalText;
					}

					// Удаляем класс has-file
					uploadArea.classList.remove('has-file');

					// Скрываем кнопку удаления
					if (removeBtn) {
						removeBtn.style.display = 'none';
					}
				}
			}
		});

		// Удаляем все сообщения об ошибках и классы состояний
		this.form.querySelectorAll('.form-group, .custom-select').forEach(formGroup => {
			formGroup.classList.remove('success', 'error');
			const errorElement = formGroup.querySelector('.input__error');
			if (errorElement) {
				errorElement.remove();
			}
		});

		// Обновляем состояние кнопки после очистки (должна стать disabled)
		this.updateSubmitButton();
	}

	/**
	 * Проверяет, все ли обязательные поля формы заполнены корректно
	 * @returns {boolean} - true, если форма валидна
	 */
	checkFormValidity() {
		let isFormValid = true;

		// Проверяем обязательные поля с валидацией
		this.rules.forEach(({ inputsList, type, validator }) => {
			inputsList.forEach(input => {
				if (type === 'checkbox') {
					// Для чекбоксов проверяем, что они отмечены
					if (input instanceof HTMLInputElement && input.type === 'checkbox') {
						if (input.hasAttribute('required') && !input.checked) {
							isFormValid = false;
						}
					}
				} else {
					// Для остальных полей проверяем, что они заполнены и валидны
					const value = this.getValue(input);
					if (!value || !validator || !validator(value)) {
						isFormValid = false;
					}
				}
			});
		});

		// Проверяем обязательные чекбоксы, которые не в rules
		const requiredCheckboxes = this.form.querySelectorAll('input[type="checkbox"][required]');
		requiredCheckboxes.forEach(checkbox => {
			if (!checkbox.checked) {
				isFormValid = false;
			}
		});

		// Проверяем обязательные кастомные селекты
		const customSelects = this.form.querySelectorAll('.custom-select[data-required="true"]');
		customSelects.forEach(select => {
			const input = select.querySelector('.custom-select__input');
			// Проверяем data-value, так как это реальное значение выбранной опции
			const dataValue = input?.getAttribute('data-value');
			if (!dataValue || !dataValue.trim()) {
				isFormValid = false;
			}
		});

		return isFormValid;
	}

	/**
	 * Обновляет состояние кнопки отправки формы (disabled/enabled)
	 */
	updateSubmitButton() {
		const submitBtn = this.form.querySelector(".btn[type='submit']");
		if (!submitBtn) return;

		const isFormValid = this.checkFormValidity();

		if (isFormValid) {
			submitBtn.removeAttribute('disabled');
		} else {
			submitBtn.setAttribute('disabled', 'disabled');
		}
	}
}

/**
 * Инициализация логики мультичекбоксов
 * Может использоваться в любой форме с раскрывающимися группами чекбоксов
 * @param {HTMLFormElement|HTMLElement} form - форма или контейнер с мультичекбоксами
 */
export function initMultiCheckboxes(form) {
	// Находим все группы мультичекбоксов
	const expandableLists = form.querySelectorAll('.form-row.expandable-list');

	expandableLists.forEach(list => {
		const checkboxAll = list.querySelector('[data-checkbox-all]');

		if (!checkboxAll) return;

		const groupName = checkboxAll.getAttribute('data-checkbox-all');
		const groupCheckboxes = list.querySelectorAll(`[data-checkbox-group="${groupName}"]`);
		const trigger = list.querySelector('.expandable-trigger');

		// Обработчик для главного чекбокса
		checkboxAll.addEventListener('change', () => {
			const isChecked = checkboxAll.checked;

			// Если чекбокс был в промежуточном состоянии, всегда выбираем все
			// Если чекбокс был выбран, то снимаем выбор со всех
			// Если чекбокс не был выбран, то выбираем все
			groupCheckboxes.forEach(checkbox => {
				checkbox.checked = isChecked;
			});

			// Сбрасываем промежуточное состояние после клика
			checkboxAll.indeterminate = false;
			checkboxAll.setAttribute('data-indeterminate', 'false');
		});

		// Обработчики для чекбоксов группы
		groupCheckboxes.forEach(checkbox => {
			checkbox.addEventListener('change', () => {
				updateMainCheckbox();
			});
		});

		// Функция обновления состояния главного чекбокса
		function updateMainCheckbox() {
			const allChecked = Array.from(groupCheckboxes).every(cb => cb.checked);
			const someChecked = Array.from(groupCheckboxes).some(cb => cb.checked);

			if (allChecked) {
				// Все чекбоксы выбраны - галочка
				checkboxAll.checked = true;
				checkboxAll.indeterminate = false;
				checkboxAll.setAttribute('data-indeterminate', 'false');
			} else if (someChecked) {
				// Некоторые чекбоксы выбраны - линия
				checkboxAll.checked = false;
				checkboxAll.indeterminate = true;
				checkboxAll.setAttribute('data-indeterminate', 'true');
			} else {
				// Ни один чекбокс не выбран - пустой
				checkboxAll.checked = false;
				checkboxAll.indeterminate = false;
				checkboxAll.setAttribute('data-indeterminate', 'false');
			}
		}

		// Предотвращаем раскрытие при клике на чекбокс и его label
		const formGroup = trigger.querySelector('.form-group');
		if (formGroup) {
			formGroup.addEventListener('click', (e) => {
				// Останавливаем всплытие, чтобы expandable не открывался при клике на чекбокс
				e.stopPropagation();
			});
		}

		// Инициализируем начальное состояние главного чекбокса
		updateMainCheckbox();
	});
}

