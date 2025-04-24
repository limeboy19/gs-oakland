<<<<<<< HEAD
import wixData from 'wix-data';

$w.onReady(function () {
  loadFilterOptions();
  setupFilterButton();
  setupClearButton();
  setupStaffRepeaterVisibility();
});

function loadFilterOptions() {
  Promise.all([
    wixData.query('Categories').ascending('title').find(),
    wixData.query('Languages').ascending('title').find()
  ])
  .then(([categoriesResult, languagesResult]) => {
    populateRepeater('#categoriesRepeater', '#checkboxTextItem', categoriesResult.items);
    populateRepeater('#languagesRepeater', '#checkboxItemLanguage', languagesResult.items);
  })
  .catch((err) => {
    console.error('Error loading data into filters:', err);
  });
}

function populateRepeater(repeaterId, checkboxId, items) {
  $w(repeaterId).data = items;
  $w(repeaterId).onItemReady(($item, itemData) => {
    $item(checkboxId).label = itemData.title;
    $item(checkboxId).checked = false;
  });
}

function setupFilterButton() {
  $w('#btnFilter').onClick(() => {
    const selectedCategoryIds = getCheckedIds('#categoriesRepeater', '#checkboxTextItem');
    const selectedLanguageIds = getCheckedIds('#languagesRepeater', '#checkboxItemLanguage');

    let query = wixData.query('Staff');

    if (selectedCategoryIds.length > 0) {
      query = query.hasSome('categories', selectedCategoryIds);
    }

    if (selectedLanguageIds.length > 0) {
      query = query.hasSome('languages', selectedLanguageIds);
    }

    query
      .include('categories')
      .include('languages')
      .find()
      .then(results => {
        const strictItems = results.items.filter(item => {
          const staffCategoryIds = (item.categories || []).map(cat => cat._id);
          const staffLanguageIds = (item.languages || []).map(lang => lang._id);

          const hasAllCategories = selectedCategoryIds.every(id => staffCategoryIds.includes(id));
          const hasAllLanguages = selectedLanguageIds.every(id => staffLanguageIds.includes(id));

          return hasAllCategories && hasAllLanguages;
        });

        $w('#repeaterStaff').data = strictItems;
      })
      .catch(err => {
        console.error('Error filtering Staff:', err);
      });
  });
}

function setupClearButton() {
  $w('#btnClear').onClick(() => {
    wixData.query('Staff')
      .include('categories')
      .include('languages')
      .find()
      .then((results) => {
        $w('#repeaterStaff').data = results.items;
      });

    clearCheckboxes('#categoriesRepeater', '#checkboxTextItem');
    clearCheckboxes('#languagesRepeater', '#checkboxItemLanguage');
  });
}

function getCheckedIds(repeaterId, checkboxId) {
  const selectedIds = [];
  $w(repeaterId).forEachItem(($item, itemData) => {
    if ($item(checkboxId).checked) {
      selectedIds.push(itemData._id);
    }
  });
  return selectedIds;
}

function clearCheckboxes(repeaterId, checkboxId) {
  $w(repeaterId).forEachItem(($item) => {
    $item(checkboxId).checked = false;
  });
}

function setupStaffRepeaterVisibility() {
  $w('#repeaterStaff').onItemReady(($item) => {
    const phone = $item("#btnPhone").label;
    const showPhone = phone && phone.trim().length > 0;

    if (!showPhone) {
      $item("#btnPhone").hide();
      $item("#btnPhone").collapse();
    } else {
      $item("#btnPhone").show();
      $item("#btnPhone").expand();
    }
  });
}

$w('#repeaterStaff').onItemReady(($item, itemData) => {
    const phoneRaw = itemData.phone;
    const phone = String(phoneRaw || '').trim();
    const hasPhone = phone.length > 0;
  
    console.log("Item:", itemData.title || itemData._id);
    console.log("Raw phone value:", phoneRaw);
    console.log("Trimmed phone value:", phone);
    console.log("Has phone:", hasPhone);
  
    if (!hasPhone) {
      console.log("→ Hiding phone button");
      $item("#btnPhone").hide();
      $item("#btnPhone").collapse();
    } else {
      console.log("→ Showing phone button");
      $item("#btnPhone").show();
      $item("#btnPhone").expand();
    }
  });
  
  
  
=======
// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
// “Hello, World!” Example: https://learn-code.wix.com/en/article/hello-world

$w.onReady(function () {
    // Write your JavaScript here

    // To select an element by ID use: $w('#elementID')

    // Click 'Preview' to run your code
});
>>>>>>> 083775c (adjust category and sub category repeater code and edit description length for master hub repeater)
