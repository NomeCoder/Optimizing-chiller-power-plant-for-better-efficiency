document.addEventListener('DOMContentLoaded', () => {
    let selectedFile = null;

    document.getElementById('excelFile').addEventListener('change', function(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            document.getElementById('uploadButton').disabled = false; // Enable the upload button once a file is selected
        }
    });

    document.getElementById('uploadButton').addEventListener('click', function() {
        if (selectedFile) {
            handleFileUpload(selectedFile);
        }
    });

    function handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const excelData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            processExcelData(excelData);
        };
        reader.readAsArrayBuffer(file);
    }

    function processExcelData(excelData) {
        const headers = excelData[0];
        const rows = excelData.slice(1);

        const WBT_C = [];
        const WBT_CIndex = headers.indexOf('WBT_C');

        // Extract WBT_C values
        rows.forEach(row => {
            if (!isNaN(row[WBT_CIndex])) {
                WBT_C.push(parseFloat(row[WBT_CIndex]));
            }
        });

        // Calculate the average of WBT_C
        const avgWBT_C = calculateAverage(WBT_C);

        // Determine status based on average WBT_C
        const updatedData = rows.map(row => {
            const rowWBT_C = parseFloat(row[WBT_CIndex]);
            const status = rowWBT_C < avgWBT_C ? 'System optimized' : 'Needs optimization';
            return [...row, status]; // Add status column
        });

        // Create the table with updated data
        headers.push('Predictions'); // Add Predictions column header
        createTable(headers, updatedData);
    }

    function calculateAverage(arr) {
        const sum = arr.reduce((acc, val) => acc + val, 0);
        return sum / arr.length;
    }

    function createTable(headers, data) {
        const tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = '';

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach((cell, index) => {
                const td = document.createElement('td');
                td.textContent = cell;

                // Add specific style to the Predictions cell
                if (index === row.length - 1) {
                    if (cell === 'Needs optimization') {
                        td.style.backgroundColor = '#ffcccc'; // Light red
                    } else if (cell === 'System optimized') {
                        td.style.backgroundColor = '#ccffcc'; // Light green
                    }
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        tableContainer.appendChild(table);
    }
});
