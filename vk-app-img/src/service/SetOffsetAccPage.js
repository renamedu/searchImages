export const setOffsetAccPage = function (page) {
    switch(true) {
        case (page <= 20):
          return 0;
        case (page >= 21 && page <= 40):
          return 1000;
        case (page >= 41 && page <= 60):
          return 2000;
        case (page >= 61 && page <= 80):
          return 3000;
        case (page >= 81 && page <= 100):
          return 4000;
        case (page >= 101 && page <= 120):
          return 5000;
        case (page >= 121 && page <= 140):
          return 6000;
        case (page >= 141 && page <= 160):
          return 7000;
        case (page >= 161 && page <= 180):
          return 8000;
        case (page >= 181 && page <= 200):
          return 9000;
        default:
          return 0;
      }
}