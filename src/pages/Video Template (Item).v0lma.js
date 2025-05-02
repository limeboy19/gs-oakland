import wixLocation from 'wix-location';
import { getFileInfo, getDownloadURL } from 'backend/media/downloadDocuments.web.js';

$w.onReady(async function () {
  $w("#dsQuickLinks").onReady(() => {
    const quickLinksItem = $w("#dsQuickLinks").getCurrentItem();
    console.log("Quick Links Object:", quickLinksItem);

    if (!quickLinksItem) {
      $w('#txtQuickLinks').collapse();
      $w('#txtQuickLinks').hide();
      $w('#repeaterQuickLinks').collapse();
    }
  });

  $w("#dsVideoItem").onReady(async () => {
    const videoItemObj = $w("#dsVideoItem").getCurrentItem();
    console.log("🎥 Video Item:", videoItemObj);

    if (!videoItemObj || !videoItemObj.downloads || videoItemObj.downloads.length < 0) {
      $w('#repeaterDownloads').collapse();
      $w('#txtDownloads').collapse();
      $w('#txtDownloads').hide();
      return;
    }

    $w('#repeaterDownloads').onItemReady(($item, itemData) => {
      console.log("📄 Repeater Item:", itemData);
      $item('#txtDownloadsItem').text = itemData.label;
      $item('#btnDownload').onClick(() => {
        wixLocation.to(itemData.url);
      });
    });

    const enrichedDownloads = await Promise.all(
		videoItemObj.downloads.map(async (ref, i) => {
		  try {
			const info = await getFileInfo(ref);
			const downloadUrl = await getDownloadURL(ref);
			return {
			  _id: `download-${i}`, 
			  label: info.originalFileName || "Download",
			  url: downloadUrl
			};
		  } catch (err) {
			console.error(`Failed [${i + 1}] for ref:`, ref, err);
			return null;
		  }
		})
	  );

	  const validDownloads = enrichedDownloads.filter(Boolean);
	  $w('#repeaterDownloads').data = validDownloads;
	  

    if (validDownloads.length < 1) {
      $w('#repeaterDownloads').collapse();
    } else {

      $w('#repeaterDownloads').data = validDownloads;
    }
  });
});
