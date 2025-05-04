import wixLocation from 'wix-location';
import { getFileInfo, getDownloadURL } from 'backend/media/downloadDocuments.web.js';

let hasDownloads = false;
let hasQuickLinks = false;

$w.onReady(async function () {

  await new Promise((resolve) => {
    $w("#dsQuickLinks").onReady(() => {
      const count = $w("#dsQuickLinks").getTotalCount();
      console.log("QuickLinks count:", count);

      if (count < 1) {
        $w("#txtQuickLinks").collapse();
        $w("#txtQuickLinks").hide();
        $w("#repeaterQuickLinks").collapse();
        $w("#repeaterQuickLinks").hide();
      } else {
        hasQuickLinks = true;
        $w("#repeaterQuickLinks").expand();
        $w("#txtQuickLinks").show();
      }

      resolve();
    });
  });

  await handleDownloadsSection();

  if (hasDownloads || hasQuickLinks) {
    console.log("Expanding additional downloads box");
    $w("#additionalDownloadsBox").expand();
  }

});

async function handleDownloadsSection() {
  await new Promise((resolve) => {
    $w("#dsRichContentItem").onReady(resolve);
  });

  const richContentItemObj = $w("#dsRichContentItem").getCurrentItem();
  console.log("Rich Content Item:", richContentItemObj);

  if (!richContentItemObj || !richContentItemObj.documents || richContentItemObj.documents.length === 0) {
    console.log("No downloads available.");

    $w('#repeaterDownloads').collapse();
    $w('#repeaterDownloads').hide();
    $w('#txtDownloads').collapse();
    $w('#txtDownloads').hide();

    return;
  }

  const enrichedDownloads = await Promise.all(
    richContentItemObj.documents.map(async (ref, i) => {
      if (ref.startsWith("wix:")) {
        // 📦 Wix Media File — use backend functions
        try {
          const [info, downloadUrl] = await Promise.all([
            getFileInfo(ref),
            getDownloadURL(ref)
          ]);

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
        // 🌐 External URL — fallback logic
        console.warn(`⚠️ Skipping media functions for external URL: ${ref}`);

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

      // Apply to both elements
      $item('#txtDownloadsItem').onClick(goToDownload);
      $item('#btnDownload').onClick(goToDownload);

    });

    $w('#txtDownloads').show();
    $w('#txtDownloads').expand();
    $w('#repeaterDownloads').data = validDownloads;
    $w('#repeaterDownloads').expand();

  } else {
    $w('#txtDownloads').hide();
    $w('#repeaterDownloads').collapse();
  }
}

