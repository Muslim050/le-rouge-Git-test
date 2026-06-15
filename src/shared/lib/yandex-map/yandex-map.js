// Инициализация интерактивной Яндекс-карты.
// API подключается в template.pug (api-maps.yandex.ru/2.1, defer).
// Данные (координаты/зум/адрес) лежат в разметке — в data-атрибутах контейнера
// [data-yandex-map]. JS только читает их и рисует карту с золотым маркером.

// Путь к иконке маркера через тот же префикс статики, что и в Pug (PUBLIC).
// __PUBLIC__ задаётся DefinePlugin в webpack; '' = относительные пути (дев).
const PUBLIC = typeof __PUBLIC__ !== 'undefined' ? __PUBLIC__ : '';
const MARKER_ICON = `${PUBLIC}assets/img/footer/map-marker.svg`;

const initMap = el => {
	const lat = parseFloat(el.dataset.lat);
	const lng = parseFloat(el.dataset.lng);
	if (Number.isNaN(lat) || Number.isNaN(lng)) return;

	const zoom = parseInt(el.dataset.zoom, 10) || 16;
	const address = el.dataset.address || '';

	const map = new window.ymaps.Map(
		el,
		{
			center: [lat, lng],
			zoom,
			controls: ['zoomControl']
		},
		{
			// убираем плашку «открыть в Яндекс.Картах» и подсказку выбора
			suppressMapOpenBlock: true,
			yandexMapDisablePoiInteractivity: true
		}
	);

	// скролл страницы не должен залипать на карте
	map.behaviors.disable('scrollZoom');

	const placemark = new window.ymaps.Placemark(
		[lat, lng],
		{ hintContent: address, balloonContentBody: address },
		{
			iconLayout: 'default#image',
			iconImageHref: MARKER_ICON,
			iconImageSize: [64, 64],
			iconImageOffset: [-32, -32]
		}
	);

	map.geoObjects.add(placemark);
	// карта загрузилась — помечаем контейнер (CSS прячет фолбэк-картинку)
	el.closest('.footer__map, .contacts__map')?.classList.add('is-map-ready');
};

const initYandexMaps = () => {
	const containers = document.querySelectorAll('[data-yandex-map]');
	if (!containers.length) return;
	if (typeof window.ymaps === 'undefined') return; // API не подгрузился

	window.ymaps.ready(() => {
		containers.forEach(initMap);
	});
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initYandexMaps);
} else {
	initYandexMaps();
}
