const DIY_PREVIEWED_PROGRESS_STORAGE_KEY = 'xinghuoji.diy.progress.previewed';
export const DIY_PREVIEWED_PROGRESS_CHANGED_KEY = `${DIY_PREVIEWED_PROGRESS_STORAGE_KEY}.changed`;

export const getTemplatePreviewProgressKey = (templateId: string) => `template:${templateId}`;
export const getWebsitePreviewProgressKey = (websiteId: string) => `website:${websiteId}`;

export const readDiyPreviewedProgressKeys = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const storedKeys = window.localStorage.getItem(DIY_PREVIEWED_PROGRESS_STORAGE_KEY);
  if (!storedKeys) {
    return [];
  }

  try {
    const parsedKeys = JSON.parse(storedKeys);
    return Array.isArray(parsedKeys)
      ? parsedKeys.filter((key): key is string => typeof key === 'string' && key.length > 0)
      : [];
  } catch {
    window.localStorage.removeItem(DIY_PREVIEWED_PROGRESS_STORAGE_KEY);
    return [];
  }
};

export const markDiyPreviewedProgressKey = (progressKey: string) => {
  if (typeof window === 'undefined' || !progressKey) {
    return;
  }

  const previewedKeys = new Set(readDiyPreviewedProgressKeys());
  previewedKeys.add(progressKey);

  window.localStorage.setItem(
    DIY_PREVIEWED_PROGRESS_STORAGE_KEY,
    JSON.stringify(Array.from(previewedKeys))
  );
  window.localStorage.setItem(DIY_PREVIEWED_PROGRESS_CHANGED_KEY, String(Date.now()));
};
