import { Banner } from '@vkontakte/vkui';
import { Icon28CancelCircleFillRed } from '@vkontakte/icons';

const ErrorBanner = () => {
    return (
        <Banner
            before={<Icon28CancelCircleFillRed />}
            header="Ошибка загрузки :("
            subheader="Попробуйте перезайти в альбом или перезагрузить приложение"
        />
    )
}

export default ErrorBanner;