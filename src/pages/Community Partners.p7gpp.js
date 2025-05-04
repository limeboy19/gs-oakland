import wixData from 'wix-data';
import { getPartnerCategoryMap } from 'backend/queries/helperQueries.web.js';

let categoryMap = {};

$w.onReady(async () => {
  categoryMap = await getPartnerCategoryMap();

  $w('#repeaterFilters').forEachItem(($item, itemData) => {
    $item('#btnPartnerFilter').onClick(() => {
      const selectedLabel = $item('#btnPartnerFilter').label;
      console.log("Selected label click:", selectedLabel);

      if (selectedLabel === "All Partners") {
        const allCategoryId = categoryMap["ALL"];
        if (!allCategoryId) return;

        const filter = wixData.filter().hasSome("_id", [allCategoryId]);
        $w('#dsPartnerCategories').setFilter(filter);
        return;
      }

      const categoryId = categoryMap[selectedLabel];
      if (!categoryId) return;

      const filter = wixData.filter().hasSome("_id", [categoryId]);
      $w('#dsPartnerCategories').setFilter(filter);
    });
  });
});
