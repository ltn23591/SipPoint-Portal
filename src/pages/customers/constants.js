export const POINT_DIRECTION = {
  EARN: "EARN",
  USE: "USE",
};

export const POINT_DIRECTION_LABEL = {
  [POINT_DIRECTION.EARN]: "Tích điểm",
  [POINT_DIRECTION.USE]: "Sử dụng điểm",
};

// Khớp enum POINT_TRANSACTION_TYPE ở backend (src/enums/index.js).
export const POINT_TRANSACTION_TYPE_LABEL = {
  ORDER: "Hóa đơn",
  REWARD: "Đổi quà",
  BIRTHDAY_GIFT: "Quà sinh nhật",
  ADJUSTMENT: "Điều chỉnh thủ công",
  REFUND: "Hoàn tiền",
  LUCKY_WHEEL: "Vòng quay may mắn",
  LUCKY_GAME: "Trò chơi may mắn",
  LUCKY_GAME_EXCHANGE_TURN: "Đổi lượt chơi",
};
