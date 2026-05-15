import PocketBase, { ClientResponseError } from "pocketbase";

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);
pb.autoCancellation(false);

pb.afterSend = (response, data) => {
  if (response.status === 401) {
    // Lazy import to avoid circular dependency
    import("@/stores/auth").then(({ useAuthStore }) => {
      useAuthStore.getState().logout();
      pb.authStore.clear();
      window.location.href = "/login";
    });
  }
  return data;
};

export default pb;

export { ClientResponseError };
