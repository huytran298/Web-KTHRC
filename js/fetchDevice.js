// Arrays to store x and y data points
let xArray = [];
let yArray = [];

// Time interval for refreshing data (ms)
const timeIntervals = 3000;

// Always hit /testconnection now
const endpoint = 'https://api.rabbitcave.com.vn';

// Track which device is selected
let CURRENT_SELECTED_DEVICE_ID = null;

// Fetch the list of devices (from the data payloads we’ve saved)
async function fecthDevice(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`Http error! Status: ${response.status}`);
    const payload = await response.json();

    // Normalize to an array
    const all = Array.isArray(payload) ? payload : [payload];

    const outputList = document.getElementById("listDevice");
    outputList.innerHTML = "";

    // Extract unique IDs
    const ids = [...new Set(all.map(r => r.data.deviceID))];
    if (ids.length === 0) {
      const li = document.createElement("li");
      li.classList.add("dropdown-item");
      li.textContent = "Không có thiết bị";
      outputList.appendChild(li);
      return;
    }

    ids.forEach(id => {
      const li = document.createElement("li");
      li.classList.add("dropdown-item");
      li.onclick = e => {
        e.preventDefault();
        getDevice(apiUrl, id);
      };
      const a = document.createElement("a");
      a.textContent = `Device ${id}`;
      li.appendChild(a);
      outputList.appendChild(li);
    });
  }
  catch (err) {
    console.error("Error fetching device list:", err);
  }
}

// Load one device’s info and first draw
async function getDevice(apiUrl, id) {
  CURRENT_SELECTED_DEVICE_ID = id;
  document.getElementById("infoId").textContent = id;
  xArray = [];
  yArray = [];

  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const payload = await resp.json();
    const all = Array.isArray(payload) ? payload : [payload];

    // Filter to this id
    const recs = all.filter(r => r.data.deviceID === id.toString());

    // Show name/type if available
    if (recs.length) {
      const { deviceName, deviceType } = recs[0].data;
      document.getElementById("infoName").textContent = deviceName;
      document.getElementById("infoType").textContent = deviceType;
    }

    // Draw time-series into #myPlot
    plotDeviceData(recs, "myPlot", `Device ${id} Data`);
  }
  catch (err) {
    console.error("Error loading device data:", err);
  }
}

// Show all devices in grid
async function fetchAllDevicesWithCharts(apiUrl) {
  try {
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`Status ${resp.status}`);
    const payload = await resp.json();
    const all = Array.isArray(payload) ? payload : [payload];

    // group by deviceID
    const byId = all.reduce((acc, r) => {
      const id = r.data.deviceID;
      (acc[id] = acc[id] || []).push(r);
      return acc;
    }, {});

    const container = document.getElementById("deviceChartGrid");
    container.innerHTML = "";

    for (let id in byId) {
      const wrapper = document.createElement("div");
      wrapper.classList.add("device-chart");

      const title = document.createElement("h5");
      title.classList.add("device-title");
      title.textContent = `Device ${id}`;
      wrapper.appendChild(title);

      const chartDiv = document.createElement("div");
      chartDiv.id = `chart-${id}`;
      chartDiv.style.width = "100%";
      chartDiv.style.height = "300px";
      wrapper.appendChild(chartDiv);

      container.appendChild(wrapper);
      plotDeviceData(byId[id], chartDiv.id, `Data for Device ${id}`);
    }
  }
  catch (err) {
    console.error("fetchAllDevicesWithCharts:", err);
  }
}

// Plot helper: given an array of records, a divId and title
function plotDeviceData(records, divId, titleText) {
  const x = [], y = [];
  records.forEach(r => {
    x.push(new Date(r.data.timeStamp * 1000));
    y.push(+r.data.Cps);
  });
  const trace = { x, y, type: 'scatter', mode: 'lines', line: { color: 'white', width: 2 } };
  const layout = {
    title: { text: titleText, font: { color: 'white' } },
    xaxis: { title: 'Time', color: 'white', gridcolor: 'rgba(255,255,255,0.2)' },
    yaxis: { title: 'CPS', color: 'white', gridcolor: 'rgba(255,255,255,0.2)' },
    paper_bgcolor: 'transparent', plot_bgcolor: 'transparent'
  };
  Plotly.newPlot(divId, [trace], layout, { scrollZoom: true });
}

// --- EXPORT FUNCTIONS ---

// Single-device export
async function fetchAndExportData(format) {
  if (!CURRENT_SELECTED_DEVICE_ID) {
    return alert("Please select a device first");
  }
  const resp = await fetch(endpoint + '/records');
  if (!resp.ok) return alert(`Status ${resp.status}`);
  const payload = await resp.json();
  const all = Array.isArray(payload) ? payload : [payload];
  const recs = all.filter(r => r.data.deviceID === CURRENT_SELECTED_DEVICE_ID.toString());
  if (!recs.length) return alert("No data for that device");

  if (format === 'csv') exportToCSV(recs);
  else if (format === 'xlsx') await exportToXLSX(recs);
  else if (format === 'tsv') exportToTSV(recs);
}

// All-devices export
async function exportAllDevicesData(format) {
  const resp = await fetch(endpoint + '/records');
  if (!resp.ok) return alert(`Status ${resp.status}`);
  const payload = await resp.json();
  const all = Array.isArray(payload) ? payload : [payload];
  if (!all.length) return alert("No data to export");

  // flatten to simple rows
  const flat = all.map(r => ({
    deviceID: r.data.deviceID,
    timeStamp: r.data.timeStamp,
    Cps: r.data.Cps,
    uSv: r.data.uSv
  }));

  if (format === 'csv') exportToCSV(flat);
  else if (format === 'xlsx') await exportToXLSX(flat);
  else if (format === 'tsv') exportToTSV(flat);
}

// CSV/XLSX/TSV helpers
function exportToCSV(data, filename = "device_data.csv") {
  const header = Object.keys(data[0]).join(",") + "\n";
  const rows = data.map(r => Object.values(r).join(",")).join("\n");
  const csv = header + rows;
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

async function exportToXLSX(data, filename = "device_data.xlsx") {
  if (typeof XLSX === "undefined") {
    await new Promise(r => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = r;
      document.head.appendChild(s);
    });
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, filename);
}

function exportToTSV(data, filename = "device_data.tsv") {
  const header = Object.keys(data[0]).join("\t") + "\n";
  const rows = data.map(r => Object.values(r).join("\t")).join("\n");
  const tsv = header + rows;
  const blob = new Blob([tsv], { type: "text/tab-separated-values" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// --- Wire up your buttons ---
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("showAllDevicesBtn")
    .addEventListener("click", () => 
      fetchAllDevicesWithCharts(endpoint + '/records')
    );

  // initial load of dropdown
  fecthDevice(endpoint + '/records');
});
