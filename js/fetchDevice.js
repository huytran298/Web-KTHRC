let xArray = [];
let yArray = [];
const timeIntervals = 500;
let devices_check = {};
async function fecthDevice(apiUrl) {
    try{
        const response = await fetch(apiUrl);
        if(!response.ok){
            throw new Error('Http error! Status : ${response.status}$');
        }
        const data = await response.json();
        
        const outputList = document.getElementById("listDevice");
        outputList.innerHTML = "";
        if(data.error){
            console.warn("API Error:", data.error);
            const listItem = document.createElement("li");
            listItem.classList.add("dropdown-item");


            const link = document.createElement("a");
            

            link.textContent = "Không có thiết bị";
            listItem.appendChild(link);
            outputList.appendChild(listItem);
            return null;
        }
        const devices = Array.isArray(data) ? data : [data];
        devices.forEach(device => {
            devices_check[device.id] = false;

            const listItem = document.createElement("li");
            listItem.classList.add("dropdown-item"); // Gán class cho mỗi thiết bị
            
            listItem.onclick = (event) => {
                event.preventDefault(); // Ngăn chặn điều hướng mặc định
                getDevice('http://localhost:5000/device?deviceID=', device.deviceID);
            };
            const link = document.createElement("a");
            
            link.textContent = `${device.deviceName}`;
            
            listItem.appendChild(link);
            outputList.appendChild(listItem);
        });
        console.log("Fetched devices:", data);
        return data;
    }
    catch (error) {
       console.error("Error fetching data:", error);
       console.error(apiUrl);
    }
}
async function getDevice(apiUrl, id){
    try {
        apiUrl += id;
        const response = await fetch(apiUrl);
        if(!response.ok){
            throw new Error('Http error! Status : ${response.status}$');
        }
        const data = await response.json();
        if(data.error){
            console.warn("API Error:", data.error);
            return null;
        }
        //set data null
        xArray = [];
        yArray = [];
        
        const devices = Array.isArray(data) ? data : [data];
        devices.forEach(device => {
            let num = device.deviceID;
            document.getElementById("infoId").textContent = `${num.toString()}`;
            document.getElementById("infoName").textContent = `${device.deviceName}`;
            document.getElementById("infoType").textContent = `${device.deviceType}`;
            
        });
        console.log("Fetched devices:", devices);
        //call function then set time to reapeatlly call api to refresh table
        for (const key in devices_check.keys()) {
            devices_check[key] = false;
        }
        devices_check[id] = true;
        sendApiRequest('http://localhost:5000/record?deviceID=', id);
        //setTimeout(() => getData('http://localhost:5000/record?deviceID=', id), timeIntervals);


    } catch(error){
        console.error("Error fetching data: ", error);
        console.error(apiUrl);
    }
}
async function resetTable() {
    xArray = [];
    yArray = [];
        
        // Define Data
    const data = [{
        x:xArray,
        y:yArray,
        type: 'scatter',
        marker: {
            color: 'blue',
                //background color of the chart container space
                //background color of plot area
        }
    }];
    
    // Define Layout
    const layout = {
      xaxis: {range: [40, 160], title: "Time"},
      yaxis: {range: [5, 16], title: "uSv"},  
      
      title: "Data table",
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
    };
    
    // Display using Plotly
    Plotly.newPlot("myPlot", data, layout,  {scrollZoom: true});
}
async function getData(apiUrl, id){
    try {
        if (devices_check[id] === false) {
            throw new Error("turn off device")
        }
        apiUrl += id;
        const response = await fetch(apiUrl);
        if(!response.ok){
            throw new Error('Http error! Status : ${response.status}$');
        }
        const data = await response.json();
        if(data.error){
            console.warn("API Error:", data.error);
            return null;
        }
        
        const devices = Array.isArray(data) ? data : [data];

        if(yArray.length > 0){
            if(Date(devices[devices.length - 1].timeStamp) === Date(yArray[yArray.length - 1])){
                console.warn(yArray.length);
                return null;
            }
            return devices;
        }
        devices.forEach(device => {
            const myUnixTimestamp = device.timeStamp; // start with a Unix timestamp

            const myDate = new Date(myUnixTimestamp * 1000); // convert timestamp to milliseconds and construct Date object
            if(yArray.length > 0 && Date(yArray[yArray.length - 1]) > myDate){
                return;
            }
            xArray.push(myDate); 
            yArray.push(parseInt(device.Cps).toString());
        });
        const dataDevice = [{
            x:xArray,
            y:yArray,
            type: 'scatter',
            marker: {
                color: 'blue',
                    //background color of the chart container space
                    //background color of plot area
            }
        }];
        // Define Layout
        const layout = {
            xaxis: {range: [40, 160], title: "Time"},
            yaxis: {range: [5, 16], title: "uSv"},  
            
            title: "Data table",
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
        };
        
        // Display using Plotly
        Plotly.newPlot("myPlot", dataDevice, layout,  {scrollZoom: true});

        console.log("Fetched devices:", devices);
        return data;
        
    }catch(error){
        console.error("Error fetching data: ", error);
        console.error(apiUrl);
        resetTable();
    }
}
function sendApiRequest(apiUrl, id) {
    getData(apiUrl, id).finally(() => {
        setTimeout(() => sendApiRequest(apiUrl, id), timeIntervals);
    });
}
