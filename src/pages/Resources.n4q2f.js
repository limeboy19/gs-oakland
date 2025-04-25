import wixData from 'wix-data';
//To:Do --> Figure out why this import breaks the page
//import {MasterHubCategories} from 'backend/queries/MasterHub.js';

const authOptions = { suppressAuth: true, suppressHooks: true };

//Global Variables
let categoryMap = {}; 
let selectedCategoryIds = [];
let selectedSubCategoryIds = [];
let searchText;
let searchFilter;

$w.onReady(async function () {

  const result = await MasterHubCategories(); 
  categoryMap = buildCategoryMap(result.items);

  await MasterHubCategories();
  setupCategoryRepeater();
  setupSubCategoryRepeater();
  setupMasterHubRepeater();

  $w('#ddlSort').value = "asc";
  sortMasterHub("asc");

  $w('#btnFilter').onClick(handleFilterClick);
  $w('#btnClear').onClick(handleClearClick);
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
      $item('#checkboxSubCategory').value = itemData._id;
    });
  });
}

function setupMasterHubRepeater() {
    $w('#dsMasterHub').onReady(() => {
      $w('#repeaterMasterHub').onItemReady(($item, itemData, index) => {
        //console.log("Item Data Master Hub", itemData);
        const originalText = itemData.description || '';
        const truncatedText = truncateToNearestWord(originalText, 105);
        $item('#txtDescription').text = truncatedText;
    

        const tags = categoryMap[itemData._id] || [];
        $item('#CategoryTags').collapse();
        
        if (tags.length) {
          $item('#CategoryTags').options = tags.map(tag => ({ label: tag, value: tag }));
          $item('#CategoryTags').expand();
        }
       
      });
    });
  }
  
  function truncateToNearestWord(text, maxLength) {
    if (text.length <= maxLength) return text;
    let cutoffIndex = text.lastIndexOf(' ', maxLength);
    let truncated = text.substring(0, cutoffIndex > 0 ? cutoffIndex : maxLength).trim();
  
    truncated = truncated.replace(/[.,;:]$/, '');
    return truncated + '...';
  }

  function buildCategoryMap(items) {
    const map = {};
    for (let item of items) {
      const categories = (item.categories || []).map(category => category.title); 
      map[item._id] = categories;
    }
    return map;
  }
  

  export async function MasterHubCategories() {
    try {
      const result = await wixData.query("MasterHubAutomated")
        .include("categories")
        .find(authOptions);
      //console.log("Backend: Query success", result.items.length);
      return result;
    } catch (err) {
      console.error("Backend error:", err);
      throw err;
    }
  }

  // Click Section for Filters of Datasets //
  
  function handleFilterClick() {
    const selectedCategoryIds = getCheckedValues('#repeaterCategories', '#checkboxCategorySelection');
    const selectedSubCategoryIds = getCheckedValues('#repeaterSubCategories', '#checkboxSubCategory');

  
    let filter = wixData.filter();
  
    if (selectedCategoryIds.length > 0) {
      filter = filter.hasSome('categories', selectedCategoryIds);
    }
  
    if (selectedSubCategoryIds.length > 0) {
      filter = filter.hasSome('subcategories', selectedSubCategoryIds);
    }
  
    $w('#dsMasterHub').setFilter(filter);
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

  function handleClearClick() {
    clearRepeaterCheckboxes('#repeaterCategories', '#checkboxCategorySelection');
    clearRepeaterCheckboxes('#repeaterSubCategories', '#checkboxSubCategory');
  
    $w('#dsMasterHub').setFilter(wixData.filter());
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

  function applyFilters() {
    let filter = wixData.filter();
  
    if (selectedCategoryIds.length > 0) {
      filter = filter.hasSome('categories', selectedCategoryIds);
    }
  
    if (selectedSubCategoryIds.length > 0) {
      filter = filter.hasSome('subcategories', selectedSubCategoryIds);
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
      console
      sort = wixData.sort().descending("title");
    } else {
      console
      // Default to ascending order
      sort = wixData.sort().ascending("title");
    }
  
    $w("#dsMasterHub").setSort(sort);
  }
  
  
  
  
  
  
  