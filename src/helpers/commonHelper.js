import { toast } from "sonner";

const TOAST_ERROR_ID = "error-toast";

export const preProcessData = (res, pageSize = 10) => {
  if (!res?.data?.isSuccess) {
    const messages = res?.data?.messages;
    if (messages?.length > 0) {
      messages?.forEach((errMes) => toast.error(errMes?.content || ""));
    } else {
      if (res?.data?.isCancel) return;
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau", {
        id: TOAST_ERROR_ID,
      });
    }
    throw new Error("Have error in preProcessData");
  }
  const data = res?.data?.data;
  return {
    data: {
      data: data?.items,
      numOfRecords: data?.totalCount,
      pageIndex: data?.pageNumber,
      pageSize,
    },
    isSuccess: res?.data?.isSuccess,
  };
};

export const preProcessDataWithCustom = (res, pageSize = 10, callback) => {
  const data = res?.data?.data;
  return {
    data: {
      data: callback ? callback(data?.items) : data?.items,
      numOfRecords: data?.totalCount,
      pageIndex: data?.pageNumber,
      pageSize,
    },
    isSuccess: res?.data?.isSuccess,
  };
};

export const preProcessDataV2 = (res, pageSize = 10, subkey = "") => {
  if (!res?.data?.isSuccess) {
    const messages = res?.data?.messages;
    if (messages?.length > 0) {
      messages?.forEach((errMes) => toast.error(errMes?.content || ""));
    } else {
      if (res?.data?.isCancel) return;
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau", {
        id: TOAST_ERROR_ID,
      });
    }
    throw new Error("Have error in preProcessDataV2");
  }
  const data = res?.data?.data;
  return {
    data: {
      data: subkey ? data?.[subkey] : data?.items,
      numOfRecords: data?.totalCount,
      pageIndex: data?.pageNumber,
      pageSize,
    },
    isSuccess: res?.data?.isSuccess,
  };
};

export const showToastOnError =
  (fn, errorFn) =>
  (response) => {
    if (response?.data?.isCancel) return;

    if (!response?.data?.isSuccess) {
      const messages = response?.data?.messages;
      if (messages?.length > 0) {
        messages?.forEach((errMes) => toast.error(errMes?.content || ""));
        errorFn?.(response);
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại sau", {
          id: TOAST_ERROR_ID,
        });
        errorFn?.(response);
        throw response;
      }
    } else {
      fn(response);
    }
  };

Object.assign(showToastOnError, { TOAST_ERROR_ID });

export function transferListTreeData(rawData = [], parentKey = "parentId") {
  if (!rawData?.length) return [];
  const map = new Map();
  const roots = [];
  rawData.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  rawData.forEach((item) => {
    const node = map.get(item.id);
    const parent = item[parentKey] ? map.get(item[parentKey]) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
