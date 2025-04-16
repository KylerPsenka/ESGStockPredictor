const backendURL = "https://your-backend-url.com/api/stock"; // Replace this with your real backend URL

// You can also fetch tickers dynamically from another endpoint
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
    const response = await fetch(`${backendURL}?ticker=${ticker}`);
    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    const years = data.stock_prices.map(p => p.Year);
    const prices = data.stock_prices.map(p => p.Price);

    const esgYears = data.esg_scores.map(e => e.Year);
    const esg = data.esg_scores.map(e => e.ESG);
    const env = data.esg_scores.map(e => e.Env);
    const soc = data.esg_scores.map(e => e.Soc);
    const gov = data.esg_scores.map(e => e.Gov);

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
      { x: esgYears, y: env, name: 'Environmental', type: 'scatter' },
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

function formatPrediction(pred) {
  return `${(pred.change * 100).toFixed(2)}% change, ${(pred.confidence * 100).toFixed(1)}% confidence`;
}
