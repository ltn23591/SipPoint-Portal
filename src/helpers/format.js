import { format, formatDistanceToNow, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DATE_FORMAT,
  DATE_TIME_FORMAT,
  ISO_DATE_FORMAT,
  ISO_DATE_TIME_FORMAT,
} from "@/constants/application";

const FORMAT_MAP = {
  [DATE_FORMAT]: "dd/MM/yyyy",
  [DATE_TIME_FORMAT]: "dd/MM/yyyy HH:mm",
  [ISO_DATE_FORMAT]: "yyyy-MM-dd",
  [ISO_DATE_TIME_FORMAT]: "yyyy-MM-dd HH:mm:ss",
};

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
  }
  return null;
};

export const formatVND = (value, options = {}) => {
  if (value === null || value === undefined || value === "") return "0 đ";
  const number = Number(value);
  if (Number.isNaN(number)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
    ...options,
  }).format(number);
};

export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined || value === "") return "0";
  const number = Number(value);
  if (Number.isNaN(number)) return "0";
  return new Intl.NumberFormat("vi-VN", options).format(number);
};

export const formatDate = (value, pattern = DATE_FORMAT) => {
  const date = toDate(value);
  if (!date) return "";
  const dateFnsPattern = FORMAT_MAP[pattern] ?? pattern;
  try {
    return format(date, dateFnsPattern, { locale: vi });
  } catch {
    return "";
  }
};

export const formatRelativeTime = (value) => {
  const date = toDate(value);
  if (!date) return "";
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch {
    return "";
  }
};

export const formatPercent = (value, fractionDigits = 1) => {
  if (value === null || value === undefined || value === "") return "0%";
  const number = Number(value);
  if (Number.isNaN(number)) return "0%";
  return `${number.toFixed(fractionDigits)}%`;
};
