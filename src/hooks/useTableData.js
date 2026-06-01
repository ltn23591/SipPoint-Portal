import { useCallback, useState } from "react";
import { PAGE_SIZE_DEFAULT } from "@/constants/application";

export function useTableData(initial = {}) {
  const [params, setParams] = useState({
    page: 1,
    pageSize: PAGE_SIZE_DEFAULT,
    keyword: "",
    sortBy: undefined,
    sortDir: undefined,
    ...initial,
  });

  const setPage = useCallback(
    (page) => setParams((prev) => ({ ...prev, page })),
    []
  );

  const setPageSize = useCallback(
    (pageSize) => setParams((prev) => ({ ...prev, page: 1, pageSize })),
    []
  );

  const setKeyword = useCallback(
    (keyword) => setParams((prev) => ({ ...prev, page: 1, keyword })),
    []
  );

  const setSort = useCallback(
    (sortBy, sortDir) => setParams((prev) => ({ ...prev, sortBy, sortDir })),
    []
  );

  const reset = useCallback(
    () =>
      setParams({
        page: 1,
        pageSize: PAGE_SIZE_DEFAULT,
        keyword: "",
        sortBy: undefined,
        sortDir: undefined,
        ...initial,
      }),
    [initial]
  );

  return {
    params,
    setParams,
    setPage,
    setPageSize,
    setKeyword,
    setSort,
    reset,
  };
}
