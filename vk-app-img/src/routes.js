import {
  createHashRouter,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  SEARCHCOPY: 'searchCopy',
  SEARCHORIGINAL: 'searchOriginal',
};

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView(DEFAULT_VIEW, [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.SEARCHCOPY, `/${DEFAULT_VIEW_PANELS.SEARCHCOPY}`, []),
      createPanel(DEFAULT_VIEW_PANELS.SEARCHORIGINAL, `/${DEFAULT_VIEW_PANELS.SEARCHORIGINAL}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
