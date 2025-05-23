const backendURL = "https://esgbackendpyt.onrender.com"; 


const tickers = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'];
const select = document.getElementById('tickerSelect');

tickers.forEach(ticker => {
  const option = document.createElement('option');
  option.value = ticker;
  option.text = ticker;
  select.appendChild(option);
});

async function fetchData() {
  const ticker = select.value;
  try {
    const response = await fetch(`${backendURL}/api/stock?ticker=${ticker}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const validStock = data.stock_prices.filter(
      p => p["Price at beginning of year"] !== null &&
           p["Price at beginning of year"] !== "#N/A Field Not Applicable" &&
           !isNaN(parseFloat(p["Price at beginning of year"]))
    );
    const years = validStock.map(p => p.Year);
    const prices = validStock.map(p => parseFloat(p["Price at beginning of year"]));

    const validESG = data.esg_scores.filter(e =>
      ![e.ESG_Score, e.Enviornmental_Score, e.Social_Score, e.Governance_Score].some(
        v => v === null || v === "#N/A Field Not Applicable" || isNaN(parseFloat(v))
      )
    );
    const esgYears = validESG.map(e => e.Year);
    const esg = validESG.map(e => parseFloat(e.ESG_Score));
    const env = validESG.map(e => parseFloat(e.Enviornmental_Score));
    const soc = validESG.map(e => parseFloat(e.Social_Score));
    const gov = validESG.map(e => parseFloat(e.Governance_Score));


    console.log("Stock years:", years);
    console.log("Stock prices:", prices);
    console.log("ESG years:", esgYears);
    console.log("ESG:", esg);
    console.log("Env:", env);
    console.log("Soc:", soc);
    console.log("Gov:", gov);
    // Plot stock prices
    Plotly.newPlot('priceChart', [{
      x: years,
      y: prices,
      name: 'Stock Price',
      type: 'scatter'
    }], {
      title: `${ticker} Stock Price (2018–2025)`
    });

    Plotly.newPlot('esgChart', [
      { x: esgYears, y: esg, name: 'ESG', type: 'scatter' },
      { x: esgYears, y: env, name: 'Enviornmental', type: 'scatter' },  // match backend spelling
      { x: esgYears, y: soc, name: 'Social', type: 'scatter' },
      { x: esgYears, y: gov, name: 'Governance', type: 'scatter' }
    ], {
      title: `${ticker} ESG Score Breakdown`,
      legend: { orientation: 'h' }
    });

    const pred = data.prediction;
    document.getElementById('predictionBox').innerHTML = `
      <h2>📈 Predicted Price Change</h2>
      <ul>
        <li><strong>1 Year:</strong> ${formatPrediction(pred['1_year'])}</li>
        <li><strong>3 Year:</strong> ${formatPrediction(pred['3_year'])}</li>
        <li><strong>5 Year:</strong> ${formatPrediction(pred['5_year'])}</li>
      </ul>
    `;
  } catch (err) {
    console.error(err);
    alert('Failed to fetch data. Check console for details.');
  }
}
