# Le Rouge — интеграция с бэкендом (Bitrix)

Документ для бэкенд-разработчика, который натягивает вёрстку на Bitrix.
Покрывает: сборку и пути, формы и отправку, данные/списки в разметке, модалки.

Стек фронта: Pug + SCSS + Vanilla JS, сборка Webpack. В `dist/` — готовые `*.html`,
`assets/` (css/js/img/fonts/files) и `modals/*.html`.

---

## 1. Сборка и пути

По умолчанию все пути **относительные** (для локальной разработки). Под Bitrix их нужно
префиксить — это делается **переменными сборки**, код править не нужно.

```bash
# обычная сборка (относительные пути)
npm run build

# сборка под Bitrix: префикс статики + ЧПУ-ссылки навигации
PUBLIC_PATH=/local/templates/main/ \
ROUTES_JSON='{"home":"/","girls":"/girls/","show":"/show/","halls":"/halls/","events":"/events/","certificate":"/certificate/","contacts":"/contacts/"}' \
npm run build
```

- `PUBLIC_PATH` — префикс для ВСЕЙ статики: `<img>`, SVG-спрайт, css/js/шрифты,
  `data-photos`/`data-video`, видео, загрузка модалок. Подставляйте путь, где реально
  лежит шаблон.
- `ROUTES_JSON` — карта навигации (меню, логотип, 404 и т.п.). Ключи:
  `home, girls, show, halls, events, certificate, contacts`. Значения — ваши ЧПУ.
- **CSS `url()` НЕ нужно префиксить** — они резолвятся относительно самого CSS-файла,
  на Bitrix работают сами.

После сборки выкладывайте `dist/` целиком, включая папку `modals/`.

---

## 2. Формы и отправка

> **Важно:** фронт success/ошибку САМ НЕ показывает (авто-success выключен).
> Фронт только валидирует форму и шлёт событие `submit-form`. Бэк сам шлёт AJAX
> и сам открывает окна `window.openSuccessModal()` / `window.openErrorModal()`.

### 2.1 Точка интеграции
Два равноценных способа — выбери удобный.

**A. Слушать событие `submit-form`** (рекомендуется, обычный DOM):
```html
<script>
document.addEventListener('submit-form', function (e) {
  var form = e.detail.form;
  var data = new FormData(form);            // все поля + контекст (см. 2.3)
  var type = data.get('form_type');
  fetch('/local/ajax/lead.php', { method: 'POST', body: data })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success) { window.LeRougeForm.closeModal(form); window.openSuccessModal(); }
      else { window.openErrorModal(); }
    })
    .catch(function () { window.openErrorModal(); });
});
</script>
```

**B. Или одна функция `window.backendFunc`** (то же самое, если так удобнее):
```html
<script>
window.backendFunc = function (form /*, event */) {
  var data = new FormData(form);
  fetch('/local/ajax/lead.php', { method: 'POST', body: data })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      if (res.success) { window.LeRougeForm.closeModal(form); window.openSuccessModal(); }
      else { window.openErrorModal(); }
    })
    .catch(function () { window.openErrorModal(); });
};
</script>
```

ВАЖНО: пока `backendFunc` объявлена — фронт **сам ничего не отправляет и не грузит**
success-модалку (т.е. GET `modals/success-modal.html` не происходит). Бэк полностью
управляет отправкой и показом результата.

Если `backendFunc` НЕ объявлена — фронт показывает демо-модалку `modals/success-modal.html`
(нужен либо `PUBLIC_PATH`, либо объявленная `backendFunc`).

### 2.2 Различение форм
Все формы зовут один и тот же `backendFunc`. Тип — в скрытом поле `form_type`:

| Форма | `form_type` | Класс формы |
|---|---|---|
| Бронь стола (модалка) | `booking_table` | `.js-booking-table` |
| Мальчишник (модалка) | `booking_bachelor` | `.js-booking-bachelor` |
| Сертификат (модалка) | `booking_certificate` | `.js-booking-certificate` |
| Заявка на мероприятие | `events_request` | `.events-form__form` |
| Сертификат (виджет) | `certificate_request` | `.certificate__form` |
| Расчёт (демо hero-form) | `calc_request` | `.hero-form` |

### 2.3 Контекст в каждой форме (скрытые поля)
В `FormData` всегда приходят, помимо полей:
- `form_type` — тип формы (статично в разметке);
- `page` — путь страницы, откуда заявка (заполняется автоматически JS);
- `page_title` — заголовок страницы (авто);
- `object` — что бронируют: название зала / событие / стол / номинал
  (заполняется автоматически при открытии модалки из карточки).

### 2.4 Вспомогательные хелперы (объявлены фронтом)
- `window.openSuccessModal()` / `window.LeRougeForm.success()` — открыть окно «успешно».
- `window.openErrorModal()` / `window.LeRougeForm.fail()` — открыть окно «ошибка» (неуспех AJAX).
- `window.LeRougeForm.closeModal(form)` — закрыть модалку, в которой лежит форма.
- Пути модалок резолвятся автоматически (от расположения `main.js` или `PUBLIC_PATH`),
  на ЧПУ работают — нужно лишь выложить папку `modals/`.

### 2.4.1 Отключить авто-success (если шлёте свой AJAX без `backendFunc`)
Любой из вариантов убирает авто-показ success — тогда вы сами слушаете `submit-form`
(или свой submit), шлёте AJAX и вызываете `window.openSuccessModal()` / `openErrorModal()`:
- глобально: `window.LeRougeAutoSuccess = false;`
- на форме: `<form ... data-no-auto-success>` (или на любом родителе).

> Проблема «авто-success мешает AJAX» (форма сертификата) решается так:
> либо задать `window.backendFunc`, либо `window.LeRougeAutoSuccess = false`.

### 2.4.2 Ошибки полей с сервера
Подсветить конкретное поле: добавить класс `.error` на его `.form-group`
и текст ошибки в элемент `.input__error` внутри этой группы.

### 2.5 Валидация
Клиентская валидация (`FormValidator`) есть на booking-формах. Форма мероприятий — с `novalidate`.
**Серверная валидация обязательна** на всех формах, клиентской доверять нельзя.

---

## 3. Данные и списки — в РАЗМЕТКЕ (не в JS)

Принцип: контент (имена, фото, цены, описания, количество, списки) лежит в DOM/`data-*`,
JS только ЧИТАЕТ. Бэк заменяет демо-цикл своим выводом из инфоблока, **сохраняя классы
и `data-*`** — JS продолжит работать без правок.

### Списки с циклом (демо-массив в начале mixin'а → ваш вывод из ИБ)
| Виджет / файл | Поля элемента | Примечание |
|---|---|---|
| `widgets/poster/poster.pug` (афиша) | `title`, `image` | слайдер Swiper |
| `widgets/gallery/gallery.pug` | `image`, `alt` | |
| `widgets/girls-select/girls-select.pug` (главная) | `name`, `photo`, `age`, `params`, `zodiac`, `zodiacIcon`, `stats[[{label,value}]]` | коверфлоу + инфо-стек, `data-index` |
| `widgets/girls-detail/girls-detail.pug` (стр. девушек) | `name`,`age`,`params`,`zodiac`,`photos[]`,`stats[{label,value}]`,`bio`,`loves`,`dislikes` | данные → в `data-*` аватарки |
| `widgets/halls-detail/halls-detail.pug` (залы) | `id`,`anchor`,`title`,`photo`,`karaoke`,`subtitle`,`description`,`depo`,`time`,`hour` | зоны + якоря + мобайл-табы, `data-index` |
| `widgets/events-detail/events-detail.pug` (мероприятия) | `id`,`anchor`,`title`,`photo`,`photos[]`,`subtitle`,`params[[{value,label}]]`,`cta` | зоны + якоря + мобайл |
| `widgets/certificate/certificate.pug` | номиналы (массив строк) | кнопки `data-value` |
| `widgets/vip-karaoke/vip-karaoke.pug` | `photo`,`title`,`params[{label,value}]`,`lead` | 2 блока |

### Фото-галереи зон/девушек
- **events-detail / girls-detail (предпочтительно)**: на каждое фото свой `<img>` внутри
  блока фото, первому — класс `is-active`. Стрелки листают (видна только `.is-active`),
  счётчик = число `<img>`. Бэк просто повторяет `<img>` в цикле.
- **halls-detail (старый вариант)**: галерея в `data-photos='[JSON]'` на `.zone`.
- **show-stage (главная сцена)**: список фото в `data-photos`, видео в `data-video`
  на `.show-stage__slider`.

### Просто текстовый контент (без циклов)
`special-menu`, `loyalty`, `food-bar`, `hall`, `show-gallery`, `hero`, заголовки/описания
секций — выводить из инфоблоков/настроек, сохраняя классы.

---

## 4. Модалки

- Грузятся динамически: `dist/modals/*.html` через `fetch` (путь префиксится `PUBLIC_PATH`).
  Поэтому папку `modals/` нужно выкладывать вместе с `dist`.
- Открытие — атрибут `data-modal-load="modals/<name>.html"` на кнопке. Контекст
  (`object`) можно передать атрибутом `data-object` на кнопке-триггере — он попадёт в
  скрытое поле формы модалки.
- Крестик закрытия — `.modal-close-btn.close-modal` (обработчик вешается автоматически
  при монтировании модалки). При адаптации не переименовывать этот класс.

---

## 5. Чек-лист запуска под Bitrix
1. Собрать с `PUBLIC_PATH` и `ROUTES_JSON` (раздел 1).
2. Выложить `dist/` целиком (включая `modals/` и `assets/`).
3. Объявить `window.backendFunc` (раздел 2) — тогда формы шлются вашим кодом, а
   success-модалка не запрашивается (404 исчезает).
4. Заменить демо-циклы списков своим выводом из инфоблоков, сохранив классы и `data-*` (раздел 3).
5. Серверная валидация всех форм.
