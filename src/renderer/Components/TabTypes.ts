export interface TabBaseInfo {
  id: string;
  title: string;
  type: string;
}

export interface TabEditorInfo extends TabBaseInfo {
  uri: string;
  doc: string;
  lang: string;
}

export interface TabPreviewInfo extends TabBaseInfo {
  uri: string;
  doc: string;
  editorId?: string;
  consolidated: boolean;
}
