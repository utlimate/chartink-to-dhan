// TEMPORARY SOLUTION TO GET BACKTESTING RESULTS REDIRECTED TO TRADINGVIEW

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // check if the chartRedirect state is true
    getChartRedirectState().then((result) => {
      if (!result.chartRedirect) {
        return;
      }
      if (result.chartRedirect) {
        // only trigger if the url begins with https://chartink.com/stocks/

        if (changeInfo.url.includes("https://chartink.com/stocks/")) {
          // stockSymbol is the part after https://chartink.com/stocks/ and before .html
          const stockSymbol = changeInfo.url
            .replace("https://chartink.com/stocks/", "")
            .replace(".html", "");

          chrome.tabs.update(tabId, {
            url: "https://in.tradingview.com/chart/?symbol=NSE:" + stockSymbol,
          });
        }
      }
    });
  }
});

// function to store chart redirect setting state in local storage
function setChartRedirectState(state) {
  chrome.storage.local.set({ chartRedirect: state });
}
// getter
function getChartRedirectState() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("chartRedirect", (result) => {
      resolve(result.chartRedirect);
    });
  });
}

async function downloadDhanSymbols() {
  try {
    // Step 1: Download CSV
    let dhanSymbols;
    const response = await fetch('https://images.dhan.co/api-data/api-scrip-master.csv', {
      method: 'GET',
      // mode: 'no-cors', // this is to prevent browser from sending 'OPTIONS' method request first
      headers: new Headers({
              'Content-Type': 'application/octet-stream',
              'connection': 'keep-alive',
    }),
    });
    if (response.ok){
      const csvData = await response.text();
      csvRows = csvData.split('\n');
      // chrome.storage.set(dhanSymbols);
      let dhanSymbols = [];

      for (const row of csvRows) {
        const columns = row.split(',');
    
        // Assuming SEM_EXM_EXCH_ID is in the first column and SEM_INSTRUMENT_NAME in the second column
        if (columns[0] === 'NSE' && columns[1] === 'E') {
          resultRow = columns;
          dhanSymbols.push([columns[0], columns[1], columns[2], columns[5], columns[7], columns[11]]);
        }
      }

      //save to local storage
      chrome.storage.local.set({ dhanSymbols });
      console.log('Sucessfull DHAN', info);
    } else {
      console.log('Empty Response', error);
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

// listener to listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "getChartRedirectState") {
    getChartRedirectState().then((result) => {
      sendResponse({ chartRedirectState: result });
    });
    return true;
  } else if (request.message === "setChartRedirectState") {
    setChartRedirectState(request.state);
    return true;
  }
  return true;
});

// on install set the chartRedirect state to true (maintain legacy functionality)
chrome.runtime.onInstalled.addListener(() => {
  setChartRedirectState(true);
  downloadDhanSymbols();
});
