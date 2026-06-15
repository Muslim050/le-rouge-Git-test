import '@/app/styles/main.scss';

import '@/pages/vacancy/ui/vacancy-calc/vacancy-calc';
import '@/pages/vacancy/ui/vacancy-content/vacancy-content';
import '@/pages/vacancy/ui/vacancy-faq/vacancy-faq';
import '@/pages/vacancy/ui/vacancy-form/vacancy-form';

import '@/widgets/certificate/certificate';
import '@/widgets/city-switcher/city-switcher';
import '@/widgets/events-detail/events-detail';
import '@/widgets/events-form/events-form';
import '@/widgets/gallery/gallery';
import '@/widgets/girls-detail/girls-detail';
import '@/widgets/girls-select/girls-select';
import '@/widgets/hall/hall';
import '@/widgets/halls-detail/halls-detail';
import '@/widgets/header/header';
import '@/widgets/main-menu/main-menu';
import '@/widgets/photo-stack/photo-stack';
import '@/widgets/poster/poster';
import '@/widgets/show-gallery/show-gallery';
import '@/widgets/show-stage/show-stage';
import '@/widgets/show-video/show-video';
import '@/widgets/special-menu/special-menu';
import '@/widgets/tg-bot/tg-bot';

import '@/features/form/form';

import '@/shared/lib/yandex-map/yandex-map';
import '@/shared/sprite';
import '@/shared/ui/modal/modal';
import '@/shared/ui/modals/booking-bachelor/booking-bachelor';
import '@/shared/ui/modals/booking-certificate/booking-certificate';
import '@/shared/ui/modals/booking-table/booking-table';
import '@/shared/ui/modals/cookies-modal/cookies-modal';
import '@/shared/ui/modals/success-modal/success-modal';
import '@/shared/ui/modals/test-modal/test-modal';

// Анти-FOUC: показываем body после загрузки CSS
const showBody = () => document.body.classList.add('is-ready');
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', showBody);
} else {
	showBody();
}
