// const axios = require("axios").default;
const cacheAvailable = "caches" in self;

const urlOne = {
  method: "GET",
  url: "https://yfapi.net/v6/finance/quote?region=SG&lang=en&symbols=C52.SI%2CC6L.SI%2CG07.SI%2CC07.SI%2CU11.SI%2CS68.SI%2CZ74.SI%2CD05.SI%2CS58.SI%2CU96.SI",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz",
  },
};

const urlTwo = {
  method: "GET",
  url: "https://yfapi.net/v6/finance/quote?region=SG&lang=en&symbols=H78.SI%2CBN4.SI%2CO39.SI%2C9CI.SI%2CQ0F.SI%2CS63.SI%2CVC2.SI%2CME8U.SI%2CBUOU.SI%2CU96.SI",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz",
  },
};

const urlIndex = {
  method: "GET",
  url: "https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=%5ESTI%2C%5EN225%2C%5EHSI%2C%5EFTSE%2C%5EGSPC%2C%5EDJI%2C%5EIXIC%2C%5ECMC200",
  headers: {
    "X-API-KEY": "Y9UUJuV4uQ5fn8Ocs8OeZ7NJsDRF5mRu6wsti1hz",
  },
};
// [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
let sortedPortfolioIndex = [];
const price = [];
const volume = [];
const marketCap = [];
const PE = [];
const PB = [];

const requestOne = axios.request(urlOne);
const requestTwo = axios.request(urlTwo);
const requestIndex = axios.request(urlIndex);

axios
  .all([requestOne, requestTwo, requestIndex])
  .then(
    axios.spread((...responses) => {
      const responseOne = responses[0];
      const responseTwo = responses[1];
      const responseThree = responses[2];

      console.log(responseOne, responseTwo);
      const dataArray1 = responseOne.data.quoteResponse.result;
      const dataArray2 = responseTwo.data.quoteResponse.result;
      const dataArrayIndex = responseThree.data.quoteResponse.result;
      const dataArray = [...dataArray1, ...dataArray2];

      const dataArrayLength = dataArray.length;

      for (let i = 0; i < dataArrayLength; i++) {
        price.push(dataArray[i].regularMarketPrice);
        volume.push(dataArray[i].regularMarketVolume);
        marketCap.push(dataArray[i].marketCap);
        PE.push(dataArray[i].forwardPE);
        PB.push(dataArray[i].priceToBook);
      }

      const priceChartData = scoringSystem(price);
      const volumeChartData = scoringSystem(volume);
      const marketCapChartData = scoringSystem(marketCap);
      const PEChartData = scoringSystem(PE);
      const PBChartData = scoringSystem(PB);

      const convertDataArray = convertData(
        priceChartData,
        volumeChartData,
        marketCapChartData,
        PEChartData,
        PBChartData
      );

      const cloneConvertDataArray = convertDataArray.slice();

      console.log(cloneConvertDataArray);

      const indexArrayLength = dataArrayIndex.length;

      if (
        window.location.pathname ==
        "/Users/kendrickwinata/GA-Project-1/index.html"
      ) {
        for (let i = 0; i < indexArrayLength; i++) {
          addIndexRowToDom(
            dataArrayIndex[i].shortName,
            dataArrayIndex[i].regularMarketPrice,
            dataArrayIndex[i].regularMarketChange,
            dataArrayIndex[i].regularMarketChangePercent
          );
        }

        for (let i = 0; i < dataArrayLength; i++) {
          const currentID = `convert-data-${i}`;
          addRowToDom(
            currentID,
            convertDataArray[i],
            dataArray[i].symbol,
            dataArray[i].longName,
            dataArray[i].regularMarketPrice,
            dataArray[i].regularMarketChange.toFixed(4),
            dataArray[i].regularMarketChangePercent.toFixed(2),
            convertNumberFormat(dataArray[i].regularMarketVolume),
            convertNumberFormat(dataArray[i].averageDailyVolume3Month),
            convertNumberFormat(dataArray[i].marketCap),
            dataArray[i].forwardPE,
            dataArray[i].priceToBook,
            "tr",
            "table-body"
          );
        }

        checkButton();
        addToPortfolio();
      }

      const sortedPortfolioIndexLength = sortedPortfolioIndex.length;
      const transferredPortfolioData = JSON.parse(
        localStorage.getItem("sortedPortfolioIndex")
      );
      const transferredPortfolioDataLength = transferredPortfolioData.length;

      if (
        window.location.pathname ==
        "/Users/kendrickwinata/GA-Project-1/portfolio.html"
      ) {
        console.log(transferredPortfolioData);

        if (transferredPortfolioDataLength > 0) {
          for (let i = 0; i < transferredPortfolioData.length; i++) {
            const chartID = "chart-id-" + transferredPortfolioData[i];
            const portfolioID = "portfolio-id-" + transferredPortfolioData[i];
            addDOMtoPorfolioPage(
              portfolioID,
              cloneConvertDataArray[`${transferredPortfolioData[i]}`],
              chartID,
              dataArray[`${transferredPortfolioData[i]}`].symbol,
              dataArray[`${transferredPortfolioData[i]}`].longName,
              dataArray[`${transferredPortfolioData[i]}`].regularMarketPrice,
              dataArray[`${transferredPortfolioData[i]}`]
                .regularMarketChangePercent
            );
          }

          addTransactionButton(
            transferredPortfolioData,
            transferredPortfolioDataLength,
            dataArray
          );

          calculateProfit(transferredPortfolioDataLength);
        }
      }

      console.log(dataArrayIndex);
    })
  )

  .catch(function (error) {
    console.error(error);
  });

const addIndexRowToDom = function (
  textName,
  textPrice,
  textChange,
  textChangePercent
) {
  textPrice = roundDecimal(textPrice);
  textChange = roundDecimal(textChange);
  textChangePercent = roundDecimal(textChangePercent);

  const divTag = document.createElement("div");
  divTag.setAttribute("class", "col index-col-width");
  const nameEl = document.createElement("div");
  nameEl.innerText = textName;
  nameEl.setAttribute("class", "index-name");
  const priceEl = document.createElement("div");
  priceEl.innerText = textPrice;
  priceEl.setAttribute("class", "index-price");
  const changeEl = document.createElement("div");
  changeEl.innerText = `${textChange} (${textChangePercent}%)`;
  changeEl.setAttribute("class", "index-change");
  setColorChange(textChange, changeEl);

  divTag.appendChild(nameEl);
  divTag.appendChild(priceEl);
  divTag.appendChild(changeEl);

  const parentSelector = document.getElementById("index-row");
  parentSelector.appendChild(divTag);
};

const setColorChange = function (textChange, changeEl) {
  if (textChange > 0) {
    changeEl.setAttribute("style", "color:green");
  } else if (textChange == 0) {
    changeEl.setAttribute("style", "color:blue");
  } else {
    changeEl.setAttribute("style", "color:red");
  }
};

const addDOMtoPorfolioPage = function (
  portfolioID,
  convertDataArray,
  chartID,
  textSymbol,
  textName,
  textPrice,
  textChangePercent
) {
  const chartPalette = document.createElement("canvas");
  const chartEl = document.createElement("div");
  chartEl.appendChild(chartPalette);
  chartPalette.setAttribute("id", chartID);
  chartPalette.setAttribute("class", "radarChart2");
  chartPalette.setAttribute("width", "100");
  chartPalette.setAttribute("height", "100");
  chartEl.setAttribute("class", "chart-container");

  const colContainerEl = document.createElement("div");
  colContainerEl.setAttribute("class", "col porto-col-width hover-overlay");

  const rowEl = document.createElement("div");
  rowEl.setAttribute("class", "row portfolio-box-padding");

  const colChartEl = document.createElement("div");
  colChartEl.setAttribute("class", "col chart-portfolio");
  colChartEl.appendChild(chartEl);

  const colPortEl = document.createElement("div");
  colPortEl.setAttribute("class", "col");
  colPortEl.setAttribute("id", portfolioID);

  const col1stRowInfo = document.createElement("div");
  col1stRowInfo.setAttribute("class", "col-symbol col-price");
  col1stRowInfo.innerText = textSymbol + " $" + textPrice;

  const col2ndRowInfo = document.createElement("div");
  col2ndRowInfo.setAttribute("class", "col-name");
  col2ndRowInfo.innerText = textName;

  const col3rdRowInfo = document.createElement("div");
  col3rdRowInfo.setAttribute("class", "col-percent-change");
  col3rdRowInfo.innerText = roundDecimal(textChangePercent) + "%";
  setColorChange(textChangePercent, col3rdRowInfo);
  const parentEl = document.getElementById("portfolio-session");

  const col4thRowButton = document.createElement("button");
  col4thRowButton.setAttribute("type", "button");
  col4thRowButton.setAttribute(
    "class",
    "btn btn-light btn-sm add-to-transaction"
  );
  col4thRowButton.innerText = "Add transaction";

  colContainerEl.appendChild(rowEl);
  rowEl.appendChild(colChartEl);
  rowEl.appendChild(colPortEl);
  colPortEl.appendChild(col1stRowInfo);
  colPortEl.appendChild(col2ndRowInfo);
  colPortEl.appendChild(col3rdRowInfo);
  colPortEl.appendChild(col4thRowButton);

  parentEl.appendChild(colContainerEl);

  makeChart(convertDataArray, chartID);
};

const addRowToDom = function (
  currentID,
  convertDataArray,
  textSymbol,
  textName,
  textPrice,
  textChange,
  textChangePercent,
  textVolume,
  textAverageVolume,
  textMarketCap,
  textPE,
  textPB,
  childSelector,
  parentSelector
) {
  //create tag for table framework
  const rowEl = document.createElement("th");
  rowEl.setAttribute("scope", "row");
  const symbolEl = document.createElement("td");
  symbolEl.setAttribute("class", "symbol");
  const nameEl = document.createElement("td");
  nameEl.setAttribute("class", "stock-name");
  const priceEl = document.createElement("td");
  const changeEl = document.createElement("td");
  const changePercentEl = document.createElement("td");
  const volumeEl = document.createElement("td");
  const averageVolumeEl = document.createElement("td");
  const marketCapEl = document.createElement("td");
  const peEl = document.createElement("td");
  const pbEl = document.createElement("td");

  const chartEl = document.createElement("td");
  const chartPalette = document.createElement("canvas");

  chartPalette.setAttribute("id", currentID);
  chartEl.setAttribute(
    "style",
    "padding: 0 0; position:relative; height:2vh ;width:2vw"
  );

  chartPalette.setAttribute("class", "radarChart");
  chartEl.appendChild(chartPalette);

  //create sub-child for checkbox
  const divEl = document.createElement("div");
  createChecklist(divEl);
  rowEl.appendChild(divEl);

  //create sub-child for a href at symbol tag
  const aRefEl = document.createElement("a");
  aRefEl.setAttribute("class", "link-primary");
  const hrefName = `./${textSymbol}.html`;
  aRefEl.setAttribute("href", hrefName);
  aRefEl.innerText = textSymbol;
  symbolEl.appendChild(aRefEl);

  setColorChange(textChange, changeEl);
  setColorChange(textChange, changePercentEl);

  //append all the tag to the table row
  const childEl = document.createElement(childSelector);
  childEl.appendChild(rowEl);
  childEl.appendChild(symbolEl);
  childEl.appendChild(nameEl);
  childEl.appendChild(priceEl);
  childEl.appendChild(changeEl);
  childEl.appendChild(changePercentEl);
  childEl.appendChild(volumeEl);
  childEl.appendChild(averageVolumeEl);
  childEl.appendChild(marketCapEl);
  childEl.appendChild(peEl);
  childEl.appendChild(pbEl);
  childEl.appendChild(chartEl);

  const parentEl = document.getElementById(parentSelector);

  textPE = roundDecimal(textPE);
  textPB = roundDecimal(textPB);

  nameEl.innerText = textName;
  priceEl.innerText = textPrice;
  changeEl.innerText = textChange;
  changePercentEl.innerText = `${textChangePercent}%`;
  volumeEl.innerText = textVolume;
  averageVolumeEl.innerText = textAverageVolume;
  marketCapEl.innerText = textMarketCap;
  peEl.innerText = textPE;
  pbEl.innerText = textPB;

  parentEl.appendChild(childEl);

  makeChart(convertDataArray, currentID);

  //assign datalist for symbol El or nameEl
  dataListAssign(textSymbol, textName);
  checkUncheck();
};

const dataListAssign = function (textSymbol, textName) {
  const datalistEl = document.getElementById("list-suggestion");
  const optionEl = document.createElement("option");
  const suggestionText = textSymbol + " " + textName;
  optionEl.setAttribute("value", suggestionText);
  datalistEl.appendChild(optionEl);
};

const convertNumberFormat = function (value) {
  return Math.abs(Number(value)) >= 1.0e9
    ? (Math.abs(Number(value)) / 1.0e9).toFixed(2) + "B"
    : Math.abs(Number(value)) >= 1.0e6
    ? (Math.abs(Number(value)) / 1.0e6).toFixed(2) + "M"
    : Math.abs(Number(value)) >= 1.0e3
    ? (Math.abs(Number(value)) / 1.0e3).toFixed(2) + "K"
    : Math.abs(Number(value));
};

const roundDecimal = function (value) {
  Number(value);
  if (isNaN(Number(value)) === true) {
    return "-";
  } else {
    return Number(value).toFixed(2);
  }
};

const checkUncheck = function () {
  const tableBody = document.querySelectorAll("checkbox");
  console.log(tableBody.checked);
};

const convertData = function (data1, data2, data3, data4, data5) {
  const groupArrayData = [];
  const dataLength = data1.length;
  for (let i = 0; i < dataLength; i++) {
    const arrayData = [data1[i], data2[i], data3[i], data4[i], data5[i]];
    groupArrayData.push(arrayData);
  }
  return groupArrayData;
};

const makeChart = function (chartData, currentID) {
  Chart.defaults.font.size = 0;
  const data = {
    labels: ["Price", "Volume", "MarketCap", "PE", "PB"],
    datasets: [
      {
        data: chartData,
        fill: true,
        backgroundColor: "rgba(4, 49, 100, 0.3)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const config = {
    type: "radar",
    data: data,
    options: {
      scales: { r: { max: 100, min: 0 } },
      plugins: {
        labels: { font: { size: 2 } },

        legend: {
          labels: { font: { size: 2 } },
          display: false,
        },
      },
      elements: {
        line: {
          borderWidth: 1,
        },
        point: { pointRadius: 0.5 },
      },
    },
  };

  const myChart = new Chart(document.getElementById(currentID), config);
};

const createChecklist = function (divEl) {
  divEl.setAttribute("class", "form-check");
  const inputEl = document.createElement("input");
  inputEl.setAttribute("class", "form-check-input");
  inputEl.setAttribute("type", "checkbox");
  inputEl.setAttribute("value", "");
  inputEl.setAttribute("id", "flexCheckDefault");
  divEl.appendChild(inputEl);
};

const scoringSystem = function (array) {
  const arrayLength = array.length;
  for (let i = 0; i < arrayLength; i++) {
    if (isNaN(Number(array[i])) === true) {
      array[i] = 0;
    }
  }

  const max = Math.max(...array);
  const mapArray = array.map((item) => Math.floor((item / max) * 75) + 25);
  console.log(max);
  console.log(mapArray);
  return mapArray;
};

let allChecklist = "";
let allChecklistLength = "";
const portfolioArrayIndex = [];

const checkButton = function () {
  const parentSelector = document.getElementById("table-body");
  parentSelector.onclick = function (event) {
    const elementClicked = event.target;
    // const elementWithEventHandler = event.currentTarget;

    console.log(elementClicked.id);
    console.log(event.currentTarget);
    console.log(elementClicked.parentElement);

    if (elementClicked.id == "flexCheckDefault") {
      allChecklist = document.querySelectorAll("#flexCheckDefault");

      allChecklistLength = allChecklist.length;
      let status = false;

      for (let i = 0; i < allChecklistLength; i++) {
        if (allChecklist[i].checked == true) {
          status = true;
        }
      }

      if (status == true) {
        document.getElementById("add-to-portfolio").disabled = false;
      } else {
        document.getElementById("add-to-portfolio").disabled = true;
      }

      console.log(status);
    }
  };
};

const addToPortfolio = function (item) {
  const addToPortoParentSelector = document.getElementById("add-to-porto-row");
  console.log(addToPortoParentSelector);
  addToPortoParentSelector.onclick = function (event) {
    const elementClicked = event.target;
    if (elementClicked.id == "add-to-portfolio") {
      for (let i = 0; i < allChecklistLength; i++) {
        if (allChecklist[i].checked == true) {
          portfolioArrayIndex.push(i);
        }
      }
      setTimeout(() => {
        alert(`Successfully added to your portfolio.`);
      }, 2);
    }
    sortedPortfolioIndex = [...new Set(portfolioArrayIndex)];
    console.log(portfolioArrayIndex);
    console.log(sortedPortfolioIndex);
    localStorage.setItem(
      "sortedPortfolioIndex",
      JSON.stringify(sortedPortfolioIndex)
    );
  };
};

const addTransactionButton = function (
  transferredPortfolioData,
  transferredPortfolioDataLength,
  dataArray
) {
  const storePortfolioData = [];
  const cloneStorePortfolioData = [];

  const parentSelector = document.getElementById("portfolio-session");
  parentSelector.onclick = function (event) {
    const elementClicked = event.target;
    const transactionButton = elementClicked.parentElement.id;
    console.log(transactionButton);
    if (elementClicked.className == "btn btn-light btn-sm add-to-transaction") {
      alert("Stock added to transaction");
    }
    console.log(transferredPortfolioData);
    for (let i = 0; i < transferredPortfolioDataLength; i++) {
      if (transactionButton == "portfolio-id-" + transferredPortfolioData[i]) {
        storePortfolioData.push(transferredPortfolioData[i]);
        cloneStorePortfolioData.push(transferredPortfolioData[i]);
      }
    }
    console.log(storePortfolioData);
    console.log(cloneStorePortfolioData);

    const popIndex = storePortfolioData.pop();
    const parentSelector = document.getElementById("table-body");
    const childEl = document.createElement("tr");
    childEl.setAttribute("id", "table-skeleton");

    const col1stEl = document.createElement("th");
    col1stEl.setAttribute("scope", "row");
    const divEl = document.createElement("div");
    createChecklist(divEl);
    col1stEl.appendChild(divEl);

    const symbolEl = document.createElement("td");
    symbolEl.setAttribute("class", "portfolio-symbol");

    const nameEl = document.createElement("td");
    nameEl.setAttribute("class", "portfolio-stock-name");

    const currentPriceEl = document.createElement("td");
    currentPriceEl.setAttribute("class", "portfolio-current-price");

    const orderDateEl = document.createElement("td");
    orderDateEl.setAttribute("class", "portfolio-order-date");

    const quantityEl = document.createElement("td");
    quantityEl.setAttribute("class", "portfolio-quantity");
    quantityEl.setAttribute("id", `portfolio-quantity-${popIndex}`);

    const transactionPriceEl = document.createElement("td");
    transactionPriceEl.setAttribute("class", "portfolio-transaction-price");
    transactionPriceEl.setAttribute(
      "id",
      `portfolio-transaction-price-${popIndex}`
    );

    const settlementAmountEl = document.createElement("td");
    settlementAmountEl.setAttribute("class", "portfolio-settlement-amount");
    settlementAmountEl.setAttribute(
      "id",
      `portfolio-settlement-amount-${popIndex}`
    );

    const profitEl = document.createElement("td");
    profitEl.setAttribute("class", "portfolio-profit");
    profitEl.setAttribute("id", `portfolio-profit-${popIndex}`);

    childEl.appendChild(col1stEl);
    childEl.appendChild(symbolEl);
    childEl.appendChild(nameEl);
    childEl.appendChild(currentPriceEl);
    childEl.appendChild(orderDateEl);
    childEl.appendChild(quantityEl);
    childEl.appendChild(transactionPriceEl);
    childEl.appendChild(settlementAmountEl);
    childEl.appendChild(profitEl);

    console.log(popIndex);
    symbolEl.innerText = dataArray[popIndex].symbol;
    nameEl.innerText = dataArray[popIndex].longName;
    currentPriceEl.innerText = "$" + dataArray[popIndex].regularMarketPrice;

    const inputDate = document.createElement("input");
    inputDate.setAttribute("type", "date");
    orderDateEl.appendChild(inputDate);

    const inputQuantity = document.createElement("input");
    inputQuantity.setAttribute("id", `input-quantity-${popIndex}`);
    inputQuantity.setAttribute("size", "15");
    inputQuantity.setAttribute("style", "text-align:right");
    quantityEl.appendChild(inputQuantity);

    const inputTransactionPrice = document.createElement("input");
    inputTransactionPrice.setAttribute("id", `input-transaction-${popIndex}`);
    inputTransactionPrice.setAttribute("size", "15");
    inputTransactionPrice.setAttribute("style", "text-align:right");
    transactionPriceEl.appendChild(inputTransactionPrice);

    parentSelector.appendChild(childEl);

    calculateProfit(cloneStorePortfolioData, dataArray);
  };
};

const calculateProfit = function (cloneStorePortfolioData, dataArray) {
  const parentSelector = document.getElementById("button-padding");

  parentSelector.onclick = function (event) {
    const elementClicked = event.target;
    if (elementClicked.id == "submit-button") {
      for (let i = 0; i < cloneStorePortfolioData.length; i++) {
        const parentElement = document.getElementById("table-body");
        const childEl = document.getElementById("table-skeleton");

        const textSettlementAmount = document.getElementById(
          `portfolio-settlement-amount-${cloneStorePortfolioData[i]}`
        );

        const quantityValue = document.getElementById(
          `input-quantity-${cloneStorePortfolioData[i]}`
        ).value;
        console.log(quantityValue);

        const transactionValue = document.getElementById(
          `input-transaction-${cloneStorePortfolioData[i]}`
        ).value;
        console.log(transactionValue);

        const calculateSettlementAmount =
          Number(quantityValue) * Number(transactionValue);

        textSettlementAmount.innerText = "$" + calculateSettlementAmount;
        const currentPrice =
          dataArray[`${cloneStorePortfolioData[i]}`].regularMarketPrice;

        const calculateProfit = roundDecimal(
          Number(quantityValue) * (currentPrice - Number(transactionValue))
        );

        const profitAmount = document.getElementById(
          `portfolio-profit-${cloneStorePortfolioData[i]}`
        );
        setColorChange(calculateProfit, profitAmount);
        profitAmount.innerText = "$" + calculateProfit;
      }
    }
  };
};
