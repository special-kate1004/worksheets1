// The function to extract data from the form
function extractFormData() {
    // Get all the inputs, textareas, and selects in the form
    var inputs = document.querySelectorAll('input, textarea, select');

    // Create a new object to hold the form data
    var formData = {};

    // Loop through each form element
    for (var i = 0; i < inputs.length; i++) {
        // If the form element has a name, add it to the formData object
        if (inputs[i].name) {
            if (inputs[i].type == 'radio') {
                // handle radio buttons: return their actual value if checked
                if (inputs[i].checked) {
                    formData[inputs[i].name] = inputs[i].value;
                }
            } else if (inputs[i].type == 'checkbox') {
                // handle checkboxes: return "Yes" if checked, otherwise "No"
                formData[inputs[i].name] = inputs[i].checked ? "Yes" : "No";
            } else {
                formData[inputs[i].name] = inputs[i].value;
            }
        }
    }

    //add worksheet Ids
    var WorksheetIds;
    if (typeof getWorksheetIds === "function") {
        WorksheetIds = getWorksheetIds();
    } else {
        WorksheetIds = []; // or some other default value
    }

    var data = {
        Fields: formData,
        WorksheetIds: WorksheetIds
    }

    // Return the formData object as a JSON string
    return JSON.stringify(data, null, 2);
}

function loadFormDataFromJsonString(jsonString) {
    // Parse the JSON string into an object
    var formData = JSON.parse(jsonString);
    loadFormData(formData);
}

function loadFormData(jsonData) {


    // Loop through each key-value pair in the formData object
    for (var key in jsonData) {
        // Get the form elements that have the name attribute matching the current key
        var inputs = document.querySelectorAll('[name="' + key + '"]');

        // Loop through each form element and set its value to the current value
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].type == 'radio') {
                // handle different inputs for radios and checkboxes
                if (inputs[i].value == jsonData[key]) {
                    inputs[i].checked = true;
                }
            } else if (inputs[i].type == 'checkbox') {
                inputs[i].checked = jsonData[key] == "Yes";
            } else {
                inputs[i].value = jsonData[key];
            }
        }
    }
}


var submitButton = document.querySelector('input[type=submit]');
var submitMessage = document.getElementById('submitMessage');


// The function to handle the form submission
function handleButtonClick(event) {
    // Prevent the form from being submitted normally
    event.preventDefault();

    // Change button text to show loading status
    submitButton.value = "Submitting...";
    submitMessage.textContent = "Saving...";
    // Get the form data as a JSON string
    var formDataJson = extractFormData();

    // Do something with the form data (like send it to a server)
    // For now, we'll just log it to the console
    console.log(formDataJson);

    const presignedUrl = "<<presignedUrl>>";

    fetch(presignedUrl, {
        method: 'PUT',
        body: formDataJson, // Converting your JSON data to a string
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            // After the response has been received, revert the button text back to the original
            submitButton.value = "Submit";

            // If response is OK, display the 'Data Saved' message, otherwise throw an error to be caught in the catch block
            if (response.ok) {
                submitMessage.textContent = "Data Saved";
                return response.text();
            } else {
                throw new Error('Network response was not ok');
            }
        })
        .then(console.log)
        .catch(error => {
            // If there's an error, revert the button text back to the original and display the error message
            submitButton.value = "Submit";
            submitMessage.textContent = "Error: " + error.message;
            console.error(error);
        });
}

// Add an event listener to the form's submit event
document.querySelector('input[type=submit]').addEventListener('click', handleButtonClick);

document.addEventListener("DOMContentLoaded", function () {
    var dataWorkSheetJson = {};
    loadFormData(dataWorkSheetJson.Fields);
});

function handleAutoInsert(inputElem, maxCount) {
    let previousValue = ''; // Store the previous value of the input

    inputElem.addEventListener('input', function () {
        const xCount = (this.value.match(/x/g) || []).length;

        // Check if the action was likely a backspace or delete (current value's length is less than previous)
        const wasBackspaceOrDelete = this.value.length < previousValue.length;

        if (!wasBackspaceOrDelete && this.value.match(/\d+ $/) && xCount < maxCount) {
            this.value = this.value.replace(/(\d+) $/, '$1 x ');
        }

        // Update the previousValue for the next event
        previousValue = this.value;
    });
}

const inputElems = document.querySelectorAll('.auto-insert-x');
inputElems.forEach(elem => handleAutoInsert(elem, 1));

const inputElemsDoubleX = document.querySelectorAll('.auto-insert-double-x');
inputElemsDoubleX.forEach(elem => handleAutoInsert(elem, 2));


