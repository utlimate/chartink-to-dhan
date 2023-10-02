let dhanSymbols;

// // Retrieve the the stored value, defaulting to an empty array.
// chrome.storage.local.get('dhanSymbols', function(data) {
//   console.log(`dhanSymbols's value is ${data.dhanSymbols}.`);
// });

function getCSVData() {
  chrome.storage.local.get(['dhanSymbols'], function (result) {
    if (result.dhanSymbols) {
      dhanSymbols = result.dhanSymbols;
    } else {
      console.error('CSV Data not found in local storage.', error);
    }
  });
}

async function downloadDhanSymbols() {
  // await fetch('https://images.dhan.co/api-data/api-scrip-master.csv', {mode: 'no-cors'})
  // .then(function(response){
  //   const csvData = response.text();
  // dhanSymbols = csvData.split('\n');
  // })
  // .catch(function(error){
  //   console.log('Dhan symbols download failed', error)
  // });
  try {
    // Step 1: Download CSV
    const response = await fetch('https://images.dhan.co/api-data/api-scrip-master.csv', {
      method: 'GET',
      mode: 'no-cors', // this is to prevent browser from sending 'OPTIONS' method request first
      headers: new Headers({
              'Content-Type': 'application/octet-stream',
              'connection': 'keep-alive',
    }),
    });
    if (response.ok){
      const csvData = await response.text();
      dhanSymbols = csvData.split('\n');
    } else {
      console.log('Empty Response', error);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

function getDhanSymbol(ticker){
  for (const row of dhanSymbols) {
    // matching dhan symbols with ticker
    if (row[3] === ticker && row[5] === '5.0000') {
      resultRow = row;
      return String(resultRow[0]) + String(resultRow[1]) + String(resultRow[2]) + ':' + String(resultRow[4]);
    }
  }
  console.log(ticker +': Row not found');
  return;
}

window.onload = function () {
  var links = document.querySelectorAll('a[href^="/stocks"]');
  for (var i = 0; i < links.length; i++) {
    const baseUrl = "https://chartink.com/stocks/";
    links[i].href =
      "https://in.tradingview.com/chart/?symbol=NSE:" +
      links[i].href.substring(baseUrl.length).replace(".html", "");
  }
};
