import { Accordion, Div, Subhead, Footnote } from '@vkontakte/vkui';
import { Icon20InfoCircleOutline } from '@vkontakte/icons';

const HomeInfoAccordion = () => {
    return (
        <Accordion>
          <Accordion.Summary style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon20InfoCircleOutline style={{ marginRight: '8px' }} />
              <span>О приложении</span>
            </div>
          </Accordion.Summary>
          <Accordion.Content>
            <Div>
            <Subhead>
              На главной странице вы можете загрузить свои изображения для поиска подлинников. Также возможно искать оригиналы среди ваших изображений в альбомах. Для каждого альбома доступны две опции: поиск копий и поиск оригиналов изображений.
            </Subhead>
            <Subhead>Поиск копий изображений:</Subhead>
            <Footnote>
              • Позволяет находить копии в выбранном альбоме.
              <br />
              • Отображает изображения с датой загрузки и размером, а также процентом сходства.
              <br />
              • Возможность просматривать найденные копии в приложении и в альбоме.
            </Footnote>
            <br />
            <Subhead>Поиск оригиналов изображений:</Subhead>
            <Footnote>
              • Ищет оригиналы изображений из альбома, по сервисам картинок (Danbooru, Anime-Pictures, e-shuushuu и др.).
              <br />
              • Если картинки нет в сервисах, будет предложено найти в Google, SauceNAO и TinEye.
              <br />
              • Возможность открыть результаты поиска.
            </Footnote>
            </Div>
          </Accordion.Content>
        </Accordion>
    )
}

export default HomeInfoAccordion;
