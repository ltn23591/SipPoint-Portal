export const POINT_TRANSACTION_TYPE = {
  ORDER: "ORDER",
  REWARD: "REWARD",
  REDEEM: "REDEEM",
  ADJUSTMENT: "ADJUSTMENT",
};

export const POINT_TRANSACTION_TYPE_LABEL = {
  [POINT_TRANSACTION_TYPE.ORDER]: "Đơn hàng",
  [POINT_TRANSACTION_TYPE.REWARD]: "Thưởng",
  [POINT_TRANSACTION_TYPE.REDEEM]: "Đổi điểm",
  [POINT_TRANSACTION_TYPE.ADJUSTMENT]: "Điều chỉnh thủ công",
};

export const POINT_TRANSACTION_TYPE_OPTIONS = Object.entries(
  POINT_TRANSACTION_TYPE_LABEL
).map(([value, label]) => ({ value, label }));
