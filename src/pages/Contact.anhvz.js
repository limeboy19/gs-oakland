import wixData from 'wix-data';

$w.onReady(function () {
  loadFilterOptions();
  setupFilterButton();
  setupClearButton();
  setupStaffRepeaterVisibility();
});

function loadFilterOptions() {
  Promise.all([
    wixData.query('JobRoles').ascending('title').find(),
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

    //console.log("Selected categories:", selectedCategoryIds);

    let baseQuery = wixData.query('Staff');
    let query = baseQuery;

    if (selectedCategoryIds.length > 0) {
      // Start with the first query
      let orQuery = wixData.query('Staff').hasSome('jobRoles', [selectedCategoryIds[0]]);

      // Add each subsequent query with an OR
      for (let i = 1; i < selectedCategoryIds.length; i++) {
        const roleId = selectedCategoryIds[i];
        orQuery = orQuery.or(wixData.query('Staff').hasSome('jobRoles', [roleId]));
      }

      query = orQuery;
    }

    if (selectedLanguageIds.length > 0) {
      query = query.hasSome('languages', selectedLanguageIds);
    }

    //console.log("Query after filters:", query);

    query
      .include('jobRoles')
      .include('languages')
      .find()
      .then(results => {
        const strictItems = results.items.filter(item => {
          const staffCategoryIds = (item.jobRoles || []).map(cat => cat._id);
          const staffLanguageIds = (item.languages || []).map(lang => lang._id);

          const matchesCategory = selectedCategoryIds.length === 0 ||
            selectedCategoryIds.some(id => staffCategoryIds.includes(id));

          const matchesLanguage = selectedLanguageIds.length === 0 ||
            selectedLanguageIds.every(id => staffLanguageIds.includes(id));

          return matchesCategory && matchesLanguage;
        });

        $w('#repeaterStaff').data = strictItems;

        if (strictItems.length > 0) {
          $w('#multiStateBoxContacts').changeState("content");
        } else {
          $w('#multiStateBoxContacts').changeState("noResults");
        }

      })
      .catch(err => {
        console.error('Error filtering Staff:', err);
      });
  });
}

function setupClearButton() {
  $w('#btnClear').onClick(() => {
    wixData.query('Staff')
      .include('jobRoles')
      .include('languages')
      .find()
      .then((results) => {
        $w('#repeaterStaff').data = results.items;

        if (results.items.length > 0) {
          $w('#multiStateBoxContacts').changeState("content");
        } else {
          $w('#multiStateBoxContacts').changeState("noResults");
        }
      });

    clearCheckboxes('#categoriesRepeater', '#checkboxTextItem');
    clearCheckboxes('#languagesRepeater', '#checkboxItemLanguage');
  });

  $w('#btnClearStateBox').onClick(() => {
    wixData.query('Staff')
      .include('jobRoles')
      .include('languages')
      .find()
      .then((results) => {
        $w('#repeaterStaff').data = results.items;

        if (results.items.length > 0) {
          $w('#multiStateBoxContacts').changeState("content");
        } else {
          $w('#multiStateBoxContacts').changeState("noResults");
        }
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

  //console.log("Item:", itemData.title || itemData._id);
  //console.log("Raw phone value:", phoneRaw);
  //console.log("Trimmed phone value:", phone);
  //console.log("Has phone:", hasPhone);

  if (!hasPhone) {
    //console.log("→ Hiding phone button");
    $item("#btnPhone").hide();
    $item("#btnPhone").collapse();
  } else {
    //console.log("→ Showing phone button");
    $item("#btnPhone").show();
    $item("#btnPhone").expand();
  }
});