const tables = [];

// Trigger mouseover events and find the parent <table>
$$('a#viewLogistic').forEach((element) => {
  // Trigger the mouseover event
  const mouseoverEvent = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
  element.dispatchEvent(mouseoverEvent);

  // Find the first parent <table> for this element
  const parentTable = element.closest('table');
  tables.push(parentTable);
});

const tooltips = $$('.tm-tooltip');

// Sort the elements by their `top` value in the `style` attribute
tooltips.sort((a, b) => {
  // Extract the `top` values from the `style` attributes
  const topA = parseFloat(a.style.top.replace('px', '')) || 0; // Default to 0 if no `top` value
  const topB = parseFloat(b.style.top.replace('px', '')) || 0;

  // Compare the `top` values
  return topA - topB;
});

const courierNoList = [];

// Loop through each tooltip in the sorted tooltips array
tooltips.forEach((tooltip) => {
  // Find the target span inside the tooltip
  const span = tooltip.querySelector('.tm-tooltip-inner .logistics-info-mod__header___1z4Ea span:nth-of-type(3)');
  
  // If the span exists, get its innerText and add to the list
  if (span) {
    courierNoList.push(span.innerText.trim()); // Trim to clean up whitespace
  } else {
    courierNoList.push(null); // Add null if the span doesn't exist
  }
});

const dictionaryList = [];

// Loop through `CourierNoList` and match each table
courierNoList.forEach((key, index) => {
  const table = tables[index]; // Match the table to the current innerText
  if (!table) return; // Skip if no matching table exists

  const items = [];
  // Find all rows or groups within the table (assuming sets of items are rows)
  const rows = table.querySelectorAll('tr'); // Update selector if needed to match item groups
  rows.forEach((row) => {
    // Extract product name
    const productName = row.querySelector('span[style="line-height:16px;"]')?.innerText.trim() || null;
      
    const priceContainer = row.querySelector('.sol-mod__no-br___2tKy9 .price-mod__price___22PIZ');
    // Find all <p> elements within the container
    if (!priceContainer) return; // Skip if the element is not found

  // Find all <p> elements within the container
   const paragraphs = priceContainer.querySelectorAll('p');

      paragraphs.forEach((p) => {
        // Check if the <p> contains a <del> element
        if (p.querySelector('del')) {
          // Remove the <p> element
          p.remove();
        }
      });
    
    // Extract product cost
    const cost = row.querySelector('.sol-mod__no-br___2tKy9 .price-mod__price___22PIZ span:nth-of-type(2)')?.innerText.trim() || null;

    // Extract product quantity
    const quantity = row.querySelector('.sol-mod__no-br___2tKy9:nth-of-type(3)')?.innerText.trim() || null;

    // If all values are valid, add an entry to the dictionary
        if (productName && cost && quantity) {
      items.push({
        productName,
        quantity,
        cost,
      });
    }
  });
  dictionaryList.push({
    key,
    value: items,
  });
});
dictionaryList

// Output the result
console.log(dictionaryList);


function generateCSV(dictionaryList) {
  // Define CSV headers
  const headers = ["Key", "Product Name", "Quantity", "Cost"];
  
  // Collect rows
  const rows = [];

  dictionaryList.forEach(({ key, value }) => {
    value.forEach((item) => {
      rows.push([key, item.productName, item.quantity, item.cost]);
    });
  });

  // Create CSV string
  const csvContent = [
    headers.join(","), // Add headers
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")), // Add rows
  ].join("\n");

  return csvContent;
}

// Generate the CSV content
const csvData = generateCSV(dictionaryList);

// Add BOM (Byte Order Mark) for proper encoding
const utf8BOM = "\uFEFF"; // BOM for UTF-8
const csvWithBOM = utf8BOM + csvData;

// Create a downloadable CSV file with UTF-8 encoding
const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.setAttribute("href", url);
link.setAttribute("download", "dictionaryList.csv");
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

