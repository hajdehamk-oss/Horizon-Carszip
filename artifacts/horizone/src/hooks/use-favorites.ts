import { useListFavorites, useAddFavorite } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListFavoritesQueryKey } from "@workspace/api-client-react";

const USER_ID = 1;

export function useFavorites() {
  const queryClient = useQueryClient();
  const { data: favorites = [] } = useListFavorites({ userId: USER_ID });
  const { mutateAsync: addFav } = useAddFavorite();

  function isFavorited(vehicleId: number): boolean {
    return favorites.some((v) => v.id === vehicleId);
  }

  async function toggleFavorite(vehicleId: number): Promise<void> {
    if (isFavorited(vehicleId)) {
      await fetch(`/api/favorites/by-vehicle?userId=${USER_ID}&vehicleId=${vehicleId}`, {
        method: "DELETE",
      });
    } else {
      await addFav({ data: { userId: USER_ID, vehicleId } });
    }
    await queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey({ userId: USER_ID }) });
  }

  return { favorites, isFavorited, toggleFavorite };
}
