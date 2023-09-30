const apiUrl = 'https://my.api.mockaroo.com/shipments.json?key=5e0b62d0';
const localFile = 'data/Shipments.txt';

let viewingOrderId; // current displayed orders id
let orders = [];

    const loadShipmentsData = (callback) => {
        axios.get(apiUrl).then(response => {// On response

            callback(response.data, false);

        }).catch(error => { // On error

            axios.get(localFile).then(response => { // Attempt to read local data file
                callback(response.data, true);

            }).catch(error => { // Local file not accessible too? Draw an error.
                appendError(error.response.data);
            })

        });
    
    /* Ajax implementation:
    const httpReq = new XMLHttpRequest();
    
    httpReq.onreadystatechange = () => {
        if (httpReq.readyState !== XMLHttpRequest.DONE)
            return;

        if (httpReq.status !== 200) { // If the get request status is not 200 OK, throw an error message.
            const errorMessage = document.createElement("H3");
            errorMessage.innerText = `HTTP error.\n status: ${httpReq.status}`

            document.body.append(errorMessage);
            return;
        }

        orders = JSON.parse(httpReq.responseText);
        generateTable(orders); // Generate tables when we receive the data
    };

    httpReq.open('GET', apiUrl);
    httpReq.send();*/
}

const updateOrdersData = (jsonData, usingLocalData) => {
    orders = jsonData;
    generateTable(orders);

    console.log("Using local copy:",usingLocalData)
    localDataWarningVisible(usingLocalData);

    loaderVisible(false);
}

const localDataWarningVisible = (visible) => { // Function to display a warning if local data is used.
    let warningElement = document.getElementById("localDataWarning")
    visible ? warningElement.style.visibility = "visible" : warningElement.style.visibility = "hidden";
}

const loaderVisible = (visible) => { // Function to display a warning if local data is used.
    let warningElement = document.getElementById("loader")
    visible ? warningElement.style.visibility = "visible" : warningElement.style.visibility = "hidden";
}

const appendError = (html) => {
    document.body.innerHTML = html;
}

const generateTable = (orders) => {
    const table = document.getElementById("ShipmentList");
    const orderKeys = Object.keys(orders[0]); // Read order keys from the first order
    
    let row = table.insertRow(0); // Create header row
    row.setAttribute('class', 'table-primary');
    
    for(let i = 0; i < orderKeys.length; i++)
        row.insertCell(i).innerHTML = orderKeys[i]; // Populate header row with order keys

    row.insertCell(orderKeys.length); // Cell reserved for buttons!
    row.insertCell(orderKeys.length); // Cell reserved for buttons!

    let index = 0;
    for(let order of orders){
        row = table.insertRow(-1); // Insert new row at the end for every order

        for(let keyId = 0; keyId < orderKeys.length; keyId++){ // Insert data to row for every key in object
            let col = row.insertCell(keyId);
            col.innerText = Object.values(order)[keyId];
        }

        // Add our buttons
        row.insertCell(orderKeys.length).insertAdjacentHTML('beforeend', `
        <button type="button" onclick="onclick=deleteRow(${index})" class="btn btn-danger"><i class="fa-regular fa-square-minus"></i></button>
        `);

        row.insertCell(orderKeys.length).insertAdjacentHTML('beforeend', `
        <button type="button" onclick="openDetails(${index})" class="btn btn-info"><i class="fa-regular fa-file"></i></button>
        `);

        index++;
        
    }
}

const clearTable = () => {
    const table = document.getElementById("ShipmentList");

    while(table.rows.length > 0)  // Delete all rows in a table
        table.deleteRow(0);
    
}

const openDetails = (index) => {
    const orderKeys = Object.keys(orders[index]); // Read keys that exist for the order at index
    let order = orders[index]; // Order passed from a button
    viewingOrderId = index;

    removeTempElements(); // Clear all temporary elements in-case the dialog is already open.
    
    for(let key of orderKeys){ // Create new inputs and element labels for every key in order
        let col = document.getElementById("shipmentDetailsArea");
        let input = document.createElement("INPUT");
        
        input.setAttribute("type", "text");
        input.setAttribute("class","form-control");
        input.setAttribute("id", key);
        input.setAttribute("value",order[key]);

        let label = document.createElement("LABEL");
        label.setAttribute("class","col-form-label");
        label.innerHTML = key;
          
        col.append(label);
        col.append(input);

    }
    
    document.getElementById("shipmentDetails").style.visibility = "visible";
}

const closeDetails = () => {
    removeTempElements(); // Remove previously generated elements such as (orderNo, etc)

    viewingOrderId = undefined
    document.getElementById("shipmentDetails").style.visibility = "hidden";
}

const removeTempElements = () => { // Remove previously generated elements such as (orderNo, etc)
    let parent = document.getElementById("shipmentDetailsArea");

    while (parent.hasChildNodes()) // Remove all child elements of shipmentDetailsArea
    parent.removeChild(parent.firstChild)
}

const deleteRow = (index) => {
    orders.splice(index, 1); // Delete row at index

    clearTable(); // Update the table
    generateTable(orders);

    closeDetails(); // Close shipment details dialog if it's open
}

const saveRow = (index) => {
    const element = document.getElementById("shipmentDetailsArea");
    const orderKeys = Object.keys(orders[index]);
    let order = orders[index]; // Get order at index

    for (let child of element.children) { // Iterate through all elements from shipmentDetailsArea container
        if(orderKeys.includes(child.getAttribute("id")) && child.tagName == "INPUT"){; // Check that it is actually corrent element
            order[child.getAttribute("id")] = child.value; // Push updates
        }
    }

    closeDetails();
    clearTable(); // Update the table
    generateTable(orders);


    
}

loadShipmentsData(updateOrdersData); // Load orders data and callback updateOrdersData function on task finish.
