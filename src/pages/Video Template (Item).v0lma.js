import wixLocation from 'wix-location';
import { getFileInfo, getDownloadURL } from 'backend/media/downloadDocuments.web.js';
import { MasterHubCategories } from 'backend/queries/MasterHubWeb.web.js';

let masterHubCategories;


$w.onReady(async function () {
  let hasQuickLinks = false;
  let hasDownloads = false;
  masterHubCategories = await MasterHubCategories();

  $w("#dsQuickLinks").onReady(() => {
    const quickLinksItem = $w("#dsQuickLinks").getCurrentItem();
    //console.log("Quick Links Object:", quickLinksItem);

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
    //console.log("🎥 Video Item:", videoItemObj);

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

            //console.log(`✅ Success [${i + 1}]`, info, downloadUrl);

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
    //console.log("✅ Valid downloads:", validDownloads);

    if (validDownloads.length > 0) {
      hasDownloads = true;

      $w('#repeaterDownloads').onItemReady(($item, itemData) => {
        //console.log("📄 Repeater Item:", itemData);
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

  $w('#repeaterMasterHubIndividual').onItemReady(($item, itemData, index) => {

    //console.log("Master Hub Individual Item:", itemData);
    //console.log("Master Hub Individual Category:", itemData?.categories);

    let textValue = itemData?.description;
    //console.log("Master Hub Individual Description:", textValue);
    if (textValue && textValue.length > 0) {
      $item('#txtDescription').text = truncateToNearestWord(itemData.description, 105);
    }
    else {
      $item('#txtDescription').collapse();
    }

    // Match itemData.title to masterHubCategories.title
    const matched = masterHubCategories.find(cat => cat.title === itemData.title);

    if (matched && Array.isArray(matched.categories)) {
      const tagOptions = matched.categories.map(cat => ({
        label: cat.title,
        value: cat._id
      }));

      $item("#selectionTagsMasterHub").options = tagOptions;
      if (tagOptions.length > 0) {
        $item("#selectionTagsMasterHub").expand();
      }
    }

  });
});

function truncateToNearestWord(text, maxLength) {
    if (text?.length <= maxLength) return text;
    let cutoffIndex = text.lastIndexOf(' ', maxLength);
    let truncated = text.substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength).trim();
    truncated = truncated.replace(/[.,;:]$/, '');
    return truncated + '...';
  }