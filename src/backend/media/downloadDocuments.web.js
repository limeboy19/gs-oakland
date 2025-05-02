import { Permissions, webMethod } from "wix-web-module";
import { mediaManager } from "wix-media-backend";

export const getFileInfo = webMethod(Permissions.Anyone, async (fileUrl) => {
    return mediaManager.getFileInfo(fileUrl);
  });

  export const getDownloadURL = webMethod(
    Permissions.Anyone,
    async (fileUrl) => {
      const myFileDownloadUrl = await mediaManager.getDownloadUrl(fileUrl);
      return myFileDownloadUrl;
    },
  );
