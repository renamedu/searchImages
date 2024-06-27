export const getSearchTime = function (imgAmount) {
    switch(true) {
        case (imgAmount <= 100):
          return "несколько секунд";
        case (imgAmount <= 500):
          return "10 секунд";
        case (imgAmount <= 1000):
          return "1 минута";
        case (imgAmount <= 1500):
          return "3 минуты";
        case (imgAmount <= 2000):
          return "5 минут";
        default:
          return "5 минут";
      }
}