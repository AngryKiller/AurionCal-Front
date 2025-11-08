import { defineBoot } from '#q-app/wrappers';
import { useAuthStore } from 'stores/auth-store';

export default defineBoot(({ router, store }) => {
  const auth = useAuthStore(store);
  auth.initialize();
  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { path: '/' };
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
      return { path: '/dashboard' };
    }
    return true;
  });
});
