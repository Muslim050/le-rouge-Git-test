# Документация по стилям форм

## Оглавление
1. [Архитектура и принципы](#архитектура-и-принципы)
2. [Структура компонентов](#структура-компонентов)
3. [Адаптивность](#адаптивность)

---

## Архитектура и принципы

### Основная философия
Форма построена на основе **модульной блочной системы** с использованием:
- **BEM-методологии** для именования классов
- **Flex-layout** для выстраивания элементов
- **Адаптивного дизайна** с тремя основными breakpoint'ами
- **Прогрессивного улучшения** (базовые input'ы работают даже без JS)

### Принципы построения
1. **Блочная структура**: форма делится на логические блоки (`.form-block`)
2. **Строки и колонки**: элементы выстраиваются в строки (`.form-row`) с гибким распределением
3. **Группировка полей**: каждое поле обернуто в `.form-group` для изоляции стилей
4. **Модификаторы**: используются для создания вариаций (`.form-row--4-col`, `.form-row--radio`)
5. **Состояния**: error states, активные состояния через классы `.error`, `.is-active`, `.is-open`

### Breakpoints
```scss
$tab      // Планшеты
$tab-sm   // Малые планшеты и мобильные
```

---

## Структура компонентов

### 1. Form Block (`.form-block`)
**Назначение**: Основной контейнер для группы связанных полей формы

**Особенности**:
- Имеет отступ снизу (на mobile значение меньше)
- Последний блок не имеет отступа (`:not(:last-child)`)

**Подкомпоненты**:
- `.form-block-title` - заголовок блока с flex-выравниванием

```html
<div class="form-block">
  <div class="form-block-title">
    <h3>Персональные данные</h3>
  </div>
  <!-- поля формы -->
</div>
```

---

### 2. Form Row (`.form-row`)
**Назначение**: Горизонтальное выстраивание полей в одну строку

**Базовая структура**:
- Flex-контейнер с отрицательными margin'ами для компенсации padding'ов
- Дочерние `.form-group` занимают 50% ширины по умолчанию
- Имеет вертикальный отступ между строками (на mobile меньше)

**Модификаторы**:

#### `.form-row--4-col`
- Разделение строки на 4 колонки (по 25%)
- Уменьшенные padding'и
- Адаптив: 2 колонки на mobile (50% каждая)

#### `.form-row--radio`
- Для группы radio-кнопок
- Уменьшенные padding'и
- Имеет row-gap на mobile

#### `.form-row--hidden`
- Скрытая строка с плавной анимацией
- Активируется классом `.is-active`
- Переходы: height, opacity, visibility
- Используется для условно показываемых полей

**Адаптивность**:
- На малых экранах: поля выстраиваются вертикально (100% ширины)
- Исключение: `.form-row--4-col` остается в 2 колонки

```html
<!-- Базовая 2-колоночная строка -->
<div class="form-row">
  <div class="form-group">
    <input type="text" class="input" placeholder="Имя">
  </div>
  <div class="form-group">
    <input type="text" class="input" placeholder="Фамилия">
  </div>
</div>

<!-- 4-колоночная строка -->
<div class="form-row form-row--4-col">
  <div class="form-group"><!-- поле 1 --></div>
  <div class="form-group"><!-- поле 2 --></div>
  <div class="form-group"><!-- поле 3 --></div>
  <div class="form-group"><!-- поле 4 --></div>
</div>

<!-- Скрытая строка -->
<div class="form-row form-row--hidden" id="additionalFields">
  <div class="form-group"><!-- условное поле --></div>
</div>
```

---

### 3. Form Column (`.form-col`)
**Назначение**: Колонка для вертикального стэка полей с общей валидацией

**Особенности**:
- Flex-контейнер с `flex-wrap: wrap`
- Имеет row-gap между элементами
- Поддержка общего сообщения об ошибке (`.form-col__error`)
- На mobile: 100% ширины без gap'а

```html
<div class="form-row">
  <div class="form-col">
    <div class="form-group">
      <input type="text" class="input">
    </div>
    <div class="form-group">
      <input type="text" class="input">
    </div>
    <div class="form-col__error">Общая ошибка для колонки</div>
  </div>
</div>
```

---

### 4. Form Group (`.form-group`)
**Назначение**: Обертка для отдельного поля ввода

**Особенности**:
- `position: relative` для абсолютного позиционирования ошибок
- Изолирует стили конкретного поля
- Поддержка error state через класс `.error`

---

### 5. Inputs

#### 5.1 Text/Number Input (`.input`)
**Стили**:
- Белый фон со скругленными углами
- Адаптивные padding'и (на mobile меньше)
- Font-size: `16px` (предотвращает auto-zoom на iOS)
- Плавные переходы для интерактивных состояний

**Типы**:
- `type="text"`
- `type="number"`

#### 5.2 Textarea (`.textarea`)
- Наследует стили от `.input`
- Имеет минимальную высоту
- Автоматическое изменение высоты (через transition)
- `resize: none` и `overflow: hidden`

#### 5.3 Checkbox (`.input[type='checkbox']`)
**Реализация**:
- Нативный input скрыт (`position: absolute`, `opacity: 0`)
- Кастомный чекбокс через `label::before`
- Квадратная форма со скругленными углами
- Галочка через background-image при `:checked`
- Поддержка indeterminate состояния (`[data-indeterminate='true']`)

**Структура**:
```html
<div class="form-group">
  <label>
    Я согласен с условиями
  </label>
  <input type="checkbox" class="input" name="agreement">
</div>
```

**Особенности**:
- Gap между label и чекбоксом
- Focus-visible состояние для accessibility

#### 5.4 Radio (`.input[type='radio']`)
**Реализация**:
- Кнопочный стиль (не круглый radio)
- Label как кнопка с padding
- Белый фон со скругленными углами
- Uppercase текст, увеличенный font-weight
- Изменение фона/цвета при `:checked`

**Использование**: в `.form-row--radio`

```html
<div class="form-row form-row--radio">
  <div class="form-group">
    <label>Опция 1</label>
    <input type="radio" class="input" name="option" value="1">
  </div>
  <div class="form-group">
    <label>Опция 2</label>
    <input type="radio" class="input" name="option" value="2">
  </div>
</div>
```

#### 5.5 File Input (`.input[type='file']`)
**Реализация**: полностью кастомная область загрузки

**Структура**:
```html
<div class="form-group">
  <div class="file-upload-area">
    <div class="file-upload-area__text">
      <span class="file-upload-area__link">Выберите файл</span>
      или перетащите его сюда
    </div>
    <div class="file-upload-area__icon">
      <!-- SVG иконка -->
    </div>
    <button class="file-upload-area__remove" style="display: none;">
      <!-- SVG крестик -->
    </button>
  </div>
  <input type="file" class="input">
  <div class="file-upload-hint">Допустимые форматы: PDF, DOC, DOCX (макс. 10 МБ)</div>
</div>
```

**Состояния**:
- Базовое: показан текст и иконка загрузки
- `.has-file`: показано имя файла и кнопка удаления
- Hover: изменение фона и цвета элементов

**Особенности**:
- Border: dashed стиль
- Адаптивная минимальная высота (меньше в `.form-col`)
- Drag & drop поддержка (реализуется через JS)

---

### 6. Custom Select (`.custom-select`)
**Назначение**: Кастомный селект с dropdown'ом

**Структура**:
```html
<div class="custom-select">
  <div class="custom-select__wrapper">
    <input type="text" class="custom-select__input input" placeholder="Выберите опцию" readonly>
    <div class="custom-select__icon">
      <!-- SVG стрелка -->
    </div>
  </div>
  <div class="custom-select__dropdown">
    <div class="custom-select__option" data-value="1">
      <span class="custom-select__option-text">Опция 1</span>
      <div class="custom-select__option-icon">
        <!-- SVG галочка -->
      </div>
    </div>
    <!-- другие опции -->
  </div>
</div>
```

**Состояния**:
- `.is-open` - dropdown открыт
- `.is-selected` - опция выбрана (показана галочка)

**Особенности**:
- Иконка поворачивается при открытии
- Dropdown с плавной анимацией (opacity, transform, visibility)
- Ограниченная максимальная высота с overflow-y scroll
- Скрытый scrollbar (для всех браузеров)
- Hover эффекты на опциях

**JS-требования**:
- Переключение класса `.is-open`
- Установка `.is-selected` на выбранную опцию
- Обновление значения input'а

---

### 7. Form Footer (`.form-footer`)
**Назначение**: Нижняя часть формы с кнопкой отправки и соглашением

**Структура**:
```html
<div class="form-footer">
  <div class="form-footer__agreement">
    <div class="form-group">
      <label>
        Я согласен с 
        <a href="#">политикой конфиденциальности</a>
      </label>
      <input type="checkbox" class="input" name="privacy">
    </div>
  </div>
  <div class="form-footer__btn">
    <button class="btn" type="submit">Отправить</button>
  </div>
</div>
```

**Layout**:
- Desktop: checkbox слева (растягивается), кнопка справа (фиксированная ширина)
- Mobile: вертикальная раскладка, кнопка на 100%

**Особенности**:
- Имеет верхний отступ (на mobile меньше)
- Отрицательные margin для выравнивания
- Кнопка всегда 100% ширины своего контейнера

---

### 8. Expandable Checkbox List (`.expandable-list`)
**Назначение**: Раскрывающийся список чекбоксов (например, для фильтров)

**Структура**:
```html
<div class="form-row expandable-list">
  <div class="expandable-item">
    <div class="expandable-trigger">
      <div class="form-group">
        <label>Основная категория</label>
        <input type="checkbox" class="input" data-indeterminate="true">
      </div>
      <button class="expandable-icon" type="button">
        <!-- SVG стрелка -->
      </button>
    </div>
    <div class="expandable-body">
      <div class="expandable-checkbox-list">
        <div class="form-group">
          <label>Подкатегория 1</label>
          <input type="checkbox" class="input">
        </div>
        <div class="form-group">
          <label>Подкатегория 2</label>
          <input type="checkbox" class="input">
        </div>
      </div>
    </div>
  </div>
</div>
```

**Состояния**:
- `.active` - раскрыт список
- Indeterminate checkbox для родительского элемента

**Особенности**:
- Имеет нижний padding с border-bottom
- Вложенные чекбоксы с отступом слева
- Стрелка поворачивается при раскрытии
- **На планшетах и ниже**: expandable функционал отключен, показаны только основные чекбоксы

**JS-требования**:
- Переключение класса `.active`
- Управление indeterminate состоянием родительского чекбокса
- Анимация раскрытия `.expandable-body`

---

## Адаптивность

### Desktop (большие экраны)
- Все функции активны
- 2-колоночная раскладка для `.form-row`
- 4-колоночная раскладка для `.form-row--4-col`
- Expandable списки работают полностью

### Tablet (средние экраны)
- `.form-row` - остается 2 колонки, но с адаптивными отступами
- `.form-block-toggle-all` - скрыт
- Expandable функционал отключен (показаны только основные чекбоксы)

### Mobile (малые экраны)
- `.form-row` - все поля на 100% ширины (вертикально)
- `.form-row--4-col` - 2 колонки по 50%
- `.form-footer` - вертикальная раскладка
- `.form-footer__btn` - кнопка на 100%
- Уменьшенные padding'и в input'ах
- Уменьшенные отступы между элементами

### Особенности mobile
- Font-size 16px в input'ах предотвращает auto-zoom на iOS
- Компактные отступы для экономии пространства

---

## Error States

### Индивидуальная ошибка поля
```html
<div class="form-group error">
  <input type="email" class="input" value="invalid">
  <div class="input__error">Некорректный email</div>
</div>
```

Стили:
- Border красного цвета с прозрачностью
- Сообщение об ошибке красного цвета
- Уменьшенный размер шрифта

### Ошибка для radio-группы
```html
<div class="form-row form-row--radio error">
  <div class="form-group">
    <label>Опция 1</label>
    <input type="radio" class="input" name="choice">
  </div>
  <div class="input__error">Выберите один из вариантов</div>
</div>
```

Особенность: ошибка позиционируется абсолютно под всей группой radio

### Ошибка для колонки
```html
<div class="form-col">
  <div class="form-group">
    <input type="text" class="input">
  </div>
  <div class="form-col__error">Общая ошибка</div>
</div>
```

---

## Требования к JavaScript

Для полного функционирования форм требуется JS для:

1. **Custom Select**:
   - Открытие/закрытие dropdown (`.is-open`)
   - Выбор опции (`.is-selected`)
   - Обновление значения

2. **File Upload**:
   - Обработка клика на `.file-upload-area`
   - Drag & drop
   - Показ имени файла (`.has-file`)
   - Удаление файла

3. **Expandable Lists**:
   - Переключение `.active`
   - Управление indeterminate состоянием
   - Анимация body

4. **Conditional Fields**:
   - Показ/скрытие `.form-row--hidden` через `.is-active`

5. **Validation**:
   - Добавление класса `.error`
   - Показ сообщений `.input__error`

6. **Textarea Auto-resize**:
   - Динамическое изменение высоты

---

## Рекомендации по использованию

### ✅ DO:
- Используйте готовые модификаторы для типовых раскладок
- Оборачивайте каждое поле в `.form-group`
- Группируйте логически связанные поля в `.form-block`
- Используйте семантичные HTML теги (`<form>`, `<label>`, `<button>`)
- Добавляйте placeholder'ы для улучшения UX

### ❌ DON'T:
- Не вкладывайте `.form-row` друг в друга
- Не используйте margin'ы для отступов между полями (используйте готовую систему)
- Не забывайте про атрибуты `name` для полей
- Не игнорируйте accessibility (используйте `label`, `aria-*`)

---

## Кастомизация

### Переменные для изменения
Основные значения, которые можно изменить через SCSS переменные:

```scss
// Цвета (закомментированы в текущей версии)
// $color-lines-grey - границы
// $color-grey - текст
// $color-grey-light - placeholder
// $color-hover - акцентный цвет при hover

// Breakpoints
$tab - планшеты
$tab-sm - малые планшеты и мобильные

// Шрифты
$font-basic - основной шрифт

// Функции
rem() - конвертация px в rem
```

### Цветовая схема
Все цвета в данный момент закомментированы и ожидают определения в переменных.
Необходимо раскомментировать и определить:
- `$color-lines-grey` - цвет границ
- `$color-grey` - основной цвет текста
- `$color-grey-light` - цвет placeholder'ов
- `$color-hover` - цвет при hover
- `$color-blue` - дополнительный акцентный
- `$color-font-accent` / `$color-font-accent3` - цвета акцентов
- `$color-back-blue` - фоновый цвет

---

## Changelog

### v1.0 (Текущая версия)
- Базовая структура форм
- Все основные типы полей
- Кастомные select и file upload
- Expandable checkbox lists
- Полная адаптивность
- Error states

---

**Автор документации**: AI Assistant  
**Дата создания**: 04.05.2026  
**Версия**: 1.0








