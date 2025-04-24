import wixData from 'wix-data';

$w.onReady(function () {
  setupCategoryRepeater();
  setupSubCategoryRepeater();
  setupMasterHubRepeater();
});

function setupCategoryRepeater() {
  $w('#dsCategories').onReady(() => {
    $w('#repeaterCategories').onItemReady(($item, itemData, index) => {
      $item('#checkboxCategorySelection').label = itemData.title;
      $item('#checkboxCategorySelection').value = itemData._id;
    });
  });
}

function setupSubCategoryRepeater() {
  $w('#dsSubCategories').onReady(() => {
    $w('#repeaterSubCategories').onItemReady(($item, itemData, index) => {
        console.log("Item Data Sub Category", itemData);
      $item('#checkboxSubCategory').label = itemData.title;
      $item('#checkboxSubCategory').value = itemData._id;
    });
  });
}

function setupMasterHubRepeater() {
    $w('#dsMasterHub').onReady(() => {
      $w('#repeaterMasterHub').onItemReady(($item, itemData, index) => {
        console.log("Item Data Master Hub", itemData);
        const originalText = itemData.description || '';
        const truncatedText = truncateToNearestWord(originalText, 105);
        $item('#txtDescription').text = truncatedText;
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
  

