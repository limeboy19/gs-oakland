import wixData from 'wix-data';
//To:Do --> Figure out why this import breaks the page
//import {MasterHubCategories} from 'backend/queries/MasterHub.js';

const authOptions = { suppressAuth: true, suppressHooks: true };

// Global Variables //
let categoryMap = {}; 
let selectedCategoryIds = [];
let selectedSubCategoryIds = [];
let selectedAgeGroupIds = [];
let searchText;
let searchFilter;

// On Ready Section //
$w.onReady(async function () {

  const result = await MasterHubCategories(); 
  categoryMap = buildCategoryMap(result.items);

  setupCategoryRepeater();
  setupSubCategoryRepeater();
  setupMasterHubRepeater();
  setupAgeCategoryRepeater();

  $w('#ddlSort').value = "asc";
  sortMasterHub("asc");

  $w('#btnFilter').onClick(handleFilterClick);
  $w('#btnClear').onClick(handleClearClick);
  $w('#btnResetFilters').onClick(handleClearClick);
  $w('#inputSearchBar').onInput(handleSearchInput);
  $w('#btnClearSearch').onClick(handleClearSearch);

  $w('#ddlSort').onChange((event) => {
      const selectedSort = event.target.value;
      sortMasterHub(selectedSort);
  });
});

// Repeater Set Up Section //
function setupCategoryRepeater() {
  $w('#dsCategories').onReady(() => {
    $w('#repeaterCategories').onItemReady(($item, itemData, index) => {
      $item('#checkboxCategorySelection').label = itemData.title;
      $item('#checkboxCategorySelection').value = itemData._id;
      $item('#checkboxCategorySelection').enable();
    });
  });
}

function setupSubCategoryRepeater() {
  $w('#dsSubCategories').onReady(() => {
    $w('#repeaterSubCategories').onItemReady(($item, itemData, index) => {
        //console.log("Item Data Sub Category", itemData);
      $item('#checkboxSubCategory').label = itemData.title;
      $item('#checkboxSubCategory').value = itemData._id;
      $item('#checkboxSubCategory').enable();
    });
  });
}

function setupAgeCategoryRepeater() {
  $w('#dsAgeGroups').onReady(() => {
    $w('#repeaterAges').onItemReady(($item, itemData, index) => {
      $item('#checkBoxAgeGroup').label = itemData.title;
      $item('#checkBoxAgeGroup').value = itemData._id;
      $item('#checkBoxAgeGroup').enable();
    });
  });
}

function setupMasterHubRepeater() {
  $w('#repeaterMasterHub').onItemReady(($item, itemData, index) => {
    //console.log("Item Data Master Hub", itemData);
    const originalText = itemData.description || '';
    const truncatedText = truncateToNearestWord(originalText, 105);
    $item('#txtDescription').text = truncatedText;

    const tags = categoryMap[itemData._id] || [];
    if (itemData.title === "Trying New Foods") console.log("Tags for item:", itemData._id, tags);

    if (tags.length) {
      $item('#CategoryTags').options = tags.map(tag => ({ label: tag, value: tag }));
      $item('#CategoryTags').expand();
    } else {
      console.log("No tags found for item:", itemData._id);
      $item('#CategoryTags').collapse();
    }
  });
}


  // Helper Functions Section //
  function truncateToNearestWord(text, maxLength) {
    if (text.length <= maxLength) return text;
    let cutoffIndex = text.lastIndexOf(' ', maxLength);
    let truncated = text.substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength).trim();
  
    truncated = truncated.replace(/[.,;:]$/, '');
    return truncated + '...';
  }

  function getCheckedValues(repeaterId, checkboxId) {
    const values = [];
    $w(repeaterId).forEachItem(($item, itemData) => {
      if ($item(checkboxId).checked) {
        values.push($item(checkboxId).value);
      }
    });
    return values;
  }

  function buildCategoryMap(items) {
    const map = {};
    for (let item of items) {
      const categories = (item.categories || []).map(category => category.title); 
      map[item._id] = categories;
    }
    return map;
  }

  function clearRepeaterCheckboxes(repeaterId, checkboxId) {
    $w(repeaterId).forEachItem(($item) => {
      $item(checkboxId).checked = false;
    });
  }

  function handleSearchInput(event) {
    searchText = event.target.value.trim();
    applyFilters();
  }

  function handleClearSearch() {
    $w('#inputSearchBar').value = "";
    searchText = "";
    applyFilters();
  }
  
  // Dataset manipulation //
  function handleFilterClick() {
    selectedCategoryIds = getCheckedValues('#repeaterCategories', '#checkboxCategorySelection');
    selectedSubCategoryIds = getCheckedValues('#repeaterSubCategories', '#checkboxSubCategory');
    selectedAgeGroupIds = getCheckedValues('#repeaterAges', '#checkBoxAgeGroup');
  
    let filter = wixData.filter();
  
    if (selectedCategoryIds.length > 0) {
      filter = filter.hasSome('categories', selectedCategoryIds);
    }
  
    if (selectedSubCategoryIds.length > 0) {
      filter = filter.hasSome('subcategories', selectedSubCategoryIds);
    }
  
    if (selectedAgeGroupIds.length > 0) {
      filter = filter.hasSome('ageGroups', selectedAgeGroupIds);
    }
  
    $w('#dsMasterHub').setFilter(filter)
      .then(() => {
        const count = $w('#dsMasterHub').getTotalCount();
        //console.log("🔎 Filtered result count:", count);
  
        if (count === 0) {
          $w('#multiStateBoxMasterHub').changeState("noResults");
        } else {
          $w('#multiStateBoxMasterHub').changeState("content");
        }
      })
      .catch((err) => {
        console.error("❌ Error applying filter:", err);
      });
  }
  


  function handleClearClick() {
    clearRepeaterCheckboxes('#repeaterCategories', '#checkboxCategorySelection');
    clearRepeaterCheckboxes('#repeaterSubCategories', '#checkboxSubCategory');
    clearRepeaterCheckboxes('#repeaterAges', '#checkBoxAgeGroup');
  
    $w('#dsMasterHub').setFilter(wixData.filter())
      .then(() => {
        const count = $w('#dsMasterHub').getTotalCount();
        //console.log("🔄 After clear, result count:", count);
  
        if (count === 0) {
          $w('#multiStateBoxMasterHub').changeState("noResults");
        } else {
          $w('#multiStateBoxMasterHub').changeState("content");
        }
      })
      .catch((err) => {
        console.error("❌ Error clearing filters:", err);
      });
  }
  


  function applyFilters() {
    let filter = wixData.filter();
  
    if (selectedCategoryIds.length > 0) {
      filter = filter.hasSome('categories', selectedCategoryIds);
    }
  
    if (selectedSubCategoryIds.length > 0) {
      filter = filter.hasSome('subcategories', selectedSubCategoryIds);
    }

    if (selectedAgeGroupIds.length > 0) {
      filter = filter.hasSome('ageGroups', selectedAgeGroupIds);
    }
  
    if (searchText.length > 0) {
       const searchFilter = wixData.filter()
        .contains('title', searchText)
        .or(wixData.filter().contains('description', searchText))
        .or(wixData.filter().contains('categories.title', searchText));
  
      filter = filter.and(searchFilter);
    }
  
    $w('#dsMasterHub').setFilter(filter);
  }


  function sortMasterHub(order) {
    let sort;

    console.log("Sort Order:", order);
  
    if (order === "desc") {
      sort = wixData.sort().descending("title");
    } else {
      sort = wixData.sort().ascending("title");
    }
  
    $w("#dsMasterHub").setSort(sort);
  }

  // Backend Function Section //
  //TO BE REMOVED//
  export async function MasterHubCategories() {
    try {
      const result = await wixData.query("MasterHubAutomated")
        .include("categories")
        .limit(1000)
        .find(authOptions);
  
      //console.log("Backend: Query success", result.items.length);
      return result;
    } catch (err) {
      console.error("Backend error:", err);
      throw err;
    }
  }
  