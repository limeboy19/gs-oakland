import wixLocation from 'wix-location';
import { getFileInfo, getDownloadURL } from 'backend/media/downloadDocuments.web.js';

$w.onReady(async function () {
  let hasQuickLinks = false;
  let hasDownloads = false;

  $w("#dsQuickLinks").onReady(() => {
    const quickLinksItem = $w("#dsQuickLinks").getCurrentItem();
    console.log("Quick Links Object:", quickLinksItem);

    if (quickLinksItem && quickLinksItem.links && quickLinksItem.links.length > 0) {
      hasQuickLinks = true;
      $w('#txtQuickLinks').show();
      $w('#repeaterQuickLinks').expand();
      $w('#additionalDownloadsBox').expand();
    } else {
      $w('#txtQuickLinks').collapse();
      $w('#repeaterQuickLinks').collapse();
    }
  });

  $w("#dsVideoItem").onReady(async () => {
    const videoItemObj = $w("#dsVideoItem").getCurrentItem();
    console.log("🎥 Video Item:", videoItemObj);

    if (!videoItemObj || !videoItemObj.downloads || videoItemObj.downloads.length === 0) {
      return;
    }

    const enrichedDownloads = await Promise.all(
      videoItemObj.downloads.map(async (ref, i) => {
        if (ref.startsWith("wix:")) {
          try {
            const [info, downloadUrl] = await Promise.all([
              getFileInfo(ref),
              getDownloadURL(ref)
            ]);

            console.log(`✅ Success [${i + 1}]`, info, downloadUrl);

            return {
              _id: `download-${i}`,
              label: info.originalFileName || "Download",
              url: downloadUrl
            };
          } catch (err) {
            console.error(`❌ Failed [${i + 1}] for ref:`, ref, err);
            return null;
          }
        } else {
          console.warn(`⚠️ External link fallback for [${i + 1}]:`, ref);

          const parsedName = ref.split('/').pop().split('?')[0];
          const label = decodeURIComponent(parsedName || "External File");

          return {
            _id: `download-${i}`,
            label,
            url: ref
          };
        }
      })
    );

    const validDownloads = enrichedDownloads.filter(Boolean);
    console.log("✅ Valid downloads:", validDownloads);

    if (validDownloads.length > 0) {
      hasDownloads = true;

      $w('#repeaterDownloads').onItemReady(($item, itemData) => {
        console.log("📄 Repeater Item:", itemData);
        $item('#txtDownloadsItem').text = itemData.label;

        // Shared click handler
        const goToDownload = () => {
          wixLocation.to(itemData.url);
        };

        $item('#txtDownloadsItem').onClick(goToDownload);
        $item('#btnDownload').onClick(goToDownload);
      });

      $w('#txtDownloads').show();
      $w('#repeaterDownloads').data = validDownloads;
      $w('#repeaterDownloads').expand();
      $w('#additionalDownloadsBox').expand();
    } else {
      $w('#txtDownloads').hide();
      $w('#repeaterDownloads').collapse();
    }
  });
});
