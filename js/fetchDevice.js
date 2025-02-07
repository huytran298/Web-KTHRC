var devicesChoose = null;
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
        devicesChoose = id;
        drawData();
        const devices = Array.isArray(data) ? data : [data];
        devices.forEach(device => {
            let num = device.deviceID;
            document.getElementById("infoId").textContent = `${num.toString()}`;
            document.getElementById("infoName").textContent = `${device.deviceName}`;
            document.getElementById("infoType").textContent = `${device.deviceType}`;
            
        });
        console.log("Fetched devices:", devices);
        return data;
        
    }catch(error){
        console.error("Error fetching data: ", error);
        console.error(apiUrl);
    }
}
async function drawData() {
    if(devicesChoose === null){
        return null;
    }
    const xArray = [50,60,70,80,90,100,110,120,130,140,150];
    const yArray = [7,8,8,9,9,9,10,11,14,14,15];
        
        // Define Data
    const data = [{
        x: ['2024-10-04 22:23:00', '2024-11-04 22:23:00', '2024-12-04 22:23:00'],
        y:[1, 3, 6],
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
      font :{
        family : './font/Bai_Jamjuree/BaiJamjuree-Regular.ttf',
      },
      title: "Data table",
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
    };
    
    // Display using Plotly
    Plotly.newPlot("myPlot", data, layout,  {scrollZoom: true});
}
async function getData(apiUrl){
    
}