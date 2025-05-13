import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";

type FilterState = {
  category: string[] | [];
  type: string[] | [];
};

const initialState: FilterState = {
  category: [],
  type: [],
};

type Actions = {
  setFilter: (category: string[], type: string[]) => void;
  clearFilter: () => void;
};

const useFilterStore = create<FilterState & Actions>()(
  persist(
    immer((set) => ({
      ...initialState,
      //setFilter
      setFilter: (category, type) => {
        set((state) => {
          if (state.category) {
            state.category = [...new Set(...state.category!, ...category)];
          }
          if (state.type) {
            state.type = [...new Set(...state.type!, ...type)];
          }
        });
      },
      clearFilter: () => set(initialState),
    })),
    {
      name: "filter-credentials", //key for sessionStorate
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useFilterStore;
