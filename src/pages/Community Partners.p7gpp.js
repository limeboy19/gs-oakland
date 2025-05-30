import wixData from 'wix-data';
import { getPartnerCategoryMap } from 'backend/queries/helperQueries.web.js';

let categoryMap = {};

$w.onReady(async () => {
  categoryMap = await getPartnerCategoryMap();
  //console.log("Category map loaded:", categoryMap);

  // Pre-select the first button and apply the gold color
  $w("#repeaterFilters").forEachItem(($item, itemData, index) => {
    if (index === 0) {
      $item("#btnPartnerFilter").style.backgroundColor = "#ffd902"; // gold
      const allCategoryId = categoryMap["All Partners"];
      if (allCategoryId) {
        const filter = wixData.filter().hasSome("_id", [allCategoryId]);
        $w('#dsPartnerCategories').setFilter(filter);
      }
    } else {
      $item("#btnPartnerFilter").style.backgroundColor = "#ffffff"; // white
    }
  });

  $w('#repeaterFilters').forEachItem(($item, itemData) => {
    $item('#btnPartnerFilter').onClick(() => {
      // Reset all buttons to white before setting clicked to gold
      $w("#repeaterFilters").forEachItem(($resetItem) => {
        $resetItem("#btnPartnerFilter").style.backgroundColor = "#ffffff";
      });
      $item('#btnPartnerFilter').style.backgroundColor = "#ffd902";
      const selectedLabel = $item('#btnPartnerFilter').label;
      //("Selected label click:", selectedLabel);

      if (selectedLabel === "All Partners") {
        const allCategoryId = categoryMap["All Partners"];
        if (!allCategoryId) return;

        const filter = wixData.filter().hasSome("_id", [allCategoryId]);
        $w('#dsPartnerCategories').setFilter(filter);
        return;
      }

      const categoryId = categoryMap[selectedLabel];
      //console.log("Selected category ID:", categoryId);
      if (!categoryId) return;

      const filter = wixData.filter().hasSome("_id", [categoryId]);
      $w('#dsPartnerCategories').setFilter(filter);
    });
  });
});
