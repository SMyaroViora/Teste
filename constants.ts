// Logic derived from the user provided image table
// Returns days to wait before NEXT reading
// Intervals for: 2nd, 3rd, 4th, 5th, 6th, 7th reading
// (1st reading happens immediately, so index 0 is used for the interval AFTER 1st read)

export const SPACED_REPETITION_TABLE = [
  { min: 1, max: 10, intervals: [1, 1, 2, 4, 7, 15, 30] },
  { min: 11, max: 20, intervals: [2, 4, 7, 15, 30, 60, 90] },
  { min: 21, max: 30, intervals: [4, 8, 16, 30, 60, 120, 240] },
  { min: 31, max: 50, intervals: [8, 16, 32, 64, 128, 256, 306] },
  { min: 51, max: 100, intervals: [16, 32, 64, 128, 256, 316, 376] },
  { min: 101, max: 500, intervals: [32, 64, 128, 256, 376, 496, 616] },
  { min: 501, max: 1000, intervals: [64, 128, 256, 512, 752, 992, 1232] },
  { min: 1001, max: 999999, intervals: [128, 256, 512, 1024, 1384, 1744, 2104] },
];

export const getNextInterval = (pageCount: number, completedReadCount: number): number => {
  // completedReadCount: 1 means we just finished the 1st read, need interval for 2nd.
  // Array index 0 matches interval for 2nd read.
  const index = completedReadCount - 1;
  if (index < 0 || index >= 7) return 0;

  const range = SPACED_REPETITION_TABLE.find(r => pageCount >= r.min && pageCount <= r.max);
  return range ? range.intervals[index] : 30; // Fallback
};

export const INITIAL_CATEGORIES = [
  "Ficção", "Negócios", "Desenvolvimento Pessoal", "Tecnologia", "História", "Filosofia"
];

export const PLACEHOLDER_COVER = "https://picsum.photos/300/450";