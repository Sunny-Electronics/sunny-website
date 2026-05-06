export interface SunnyKrProjectFilesConfig {
  root: string;
  rfqPoEmailSamplesDir: string;
  orderListWorkbookPath: string;
  sourcingScheduleWorkbookPath: string;
}

const DEFAULT_ROOT =
  "C:\\Users\\admin\\Documents\\New project\\SunnyKR_Project_Files";

export function getSunnyKrProjectFilesConfig(): SunnyKrProjectFilesConfig {
  const root = process.env.SUNNYKR_PROJECT_FILES_ROOT || DEFAULT_ROOT;

  return {
    root,
    rfqPoEmailSamplesDir:
      process.env.SUNNYKR_RFQ_PO_EMAIL_SAMPLES_DIR ||
      `${root}\\07_RFQ_PO_Email_Samples`,
    orderListWorkbookPath:
      process.env.SUNNYKR_ORDERLIST_WORKBOOK_PATH ||
      `${root}\\04_Documents_SPA_Private\\orderlist 26.05.06.xlsx`,
    sourcingScheduleWorkbookPath:
      process.env.SUNNYKR_SOURCING_SCHEDULE_WORKBOOK_PATH ||
      `${root}\\04_Documents_SPA_Private\\sourcing schedule 26.05.06.xlsx`,
  };
}
