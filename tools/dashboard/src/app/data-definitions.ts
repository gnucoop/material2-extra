/** Interface that describes the payload results from the Firebase database. */
export interface PayloadResult {
  timestamp: number;
  // M2E Calendar bundles
  m2e_calendar_umd: number;
  m2e_calendar_umd_minified_uglify: number;
  m2e_calendar_fesm_2015: number;
  m2e_calendar_fesm_2014: number;
  // M2E Masonry bundles
  m2e_masonry_umd: number;
  m2e_masonry_umd_minified_uglify: number;
  m2e_masonry_fesm_2015: number;
  m2e_masonry_fesm_2014: number;
}
