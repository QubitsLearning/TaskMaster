// Variables for accessing HTML elements.
const dashboardLink = document.getElementById("dashboardLink");
const completedTasksLink = document.getElementById("completedTasksLink");
const dashboard = document.getElementById("dashboard");
const completedTasks = document.getElementById("completedTasks");
const sortButton = document.getElementById("sortButton");
const modalForm = document.getElementById("modalForm");
const ascending = document.getElementById("ascending");
const descending = document.getElementById("descending");
const removeSort = document.getElementById("removeSort");
const saveButton = document.getElementById("saveButton");
const closeButton1 = document.getElementById("closeButton1");
const closeButton2 = document.getElementById("closeButton2");

// Event listeners
saveButton.addEventListener("click", insertTask);
saveButton.addEventListener("click", resetModal);
closeButton1.addEventListener("click", resetModal);
closeButton2.addEventListener("click", resetModal);
dashboardLink.addEventListener("click", showDashboard);
completedTasksLink.addEventListener("click", showCompletedTasks);
modalForm.addEventListener("input", formValidation);
ascending.addEventListener("click", sortTableAscending);
descending.addEventListener("click", sortTableDescending);
removeSort.addEventListener("click", unsortedTable);


// Initialize the DB.
const createQuery = "CREATE TABLE taskdata (task_id INTEGER PRIMARY KEY, task_name TEXT, description TEXT, category TEXT, priority TEXT, due_date TEXT, status TEXT);";
var dbAPI = new DB(createQuery);

// Function to show the dashboard table, regulate the collapse component visibility, and highlight the active navigation menu item.
function showDashboard() {
  dashboard.classList.add("show");
  completedTasks.classList.remove("show");
  dashboardLink.classList.add("active");
  completedTasksLink.classList.remove("active");
  queryData("Open");
}

// Function to show the completed tasks table, regulate the collapse component visibility, and highlight the active navigation menu item.
function showCompletedTasks() {
  completedTasks.classList.add("show");
  dashboard.classList.remove("show");
  completedTasksLink.classList.add("active");
  dashboardLink.classList.remove("active");
  queryData("Done");
}

//Function to reset the modal by clicking the close and save buttons.
function resetModal() {
  modalForm.reset();
  saveButton.disabled = true;
  document.querySelector(".error").style.display = "none";
}

//Function to validate the form inside the modal box.
function formValidation() {
  //Get the error div element.
  const error = document.querySelector(".error");
  //Get the mandatory fields. We got the save button already in the variable saveButton.
  const taskName = document.getElementById("taskName").value;
  const dueDate = document.getElementById("dueDate").value;
  /*Check whether the task name is already present. If it is not present, check the mandatory fields. If the fields are empty, disable the save button. Else, enable it*/
  var result = dbAPI.select("SELECT task_name FROM taskdata WHERE task_name = ?", [taskName]);
  if (result.length === 0) {
    if (taskName !== '' && dueDate !== '') {
      saveButton.disabled = false;
    } else {
      saveButton.disabled = true;
    }
    error.style.display = "none";
  }
  //If the task name is present, display the error message in the error div.
  else {
    error.textContent = "Task name already existed. Try with a   different name.";
    error.style.display = "block";
    saveButton.disabled = true;
  }
}
//Function to insert the new task data by clicking the save button in the add task modal.
function insertTask() {
  // Getting the form data.
  var taskID = Date.now();
  var taskName = document.getElementById("taskName").value;
  var description = document.getElementById("description").value;
  var dueDate = document.getElementById("dueDate").value;
  var category = document.getElementById("categoryDropDown").value;
  var priority = document.getElementById("priorityDropDown").value;
  var status = "Open";
  // Inserting the data into the database using the insert() method in boilerplate code.
  dbAPI.insert("INSERT INTO taskdata VALUES (?, ?, ?, ?, ?, ?,?)", [taskID, taskName, description, category, priority, dueDate, status]);
   //Call the queryData() function with the Open parameter to render the dashboard table.
  queryData("Open");
}

//Function to delete the task data by clicking the delete button.
function deleteTask(taskName) {
  dbAPI.delete("DELETE FROM taskdata WHERE task_name = ?", [taskName]);
  if (dashboard.classList.contains("show")) {
    queryData("Open");
  }
  else {
    queryData("Done");
  }
}

//Function to mark the status of the tasks from Open to Done.
function moveToComplete(taskName) {
  dbAPI.update("UPDATE taskdata SET status = 'Done' WHERE task_name = ?", [taskName]);
  queryData("Open");
}

//Function to sort the table data in ascending order by the due date.
function sortTableAscending() {
  let element, result, statusValue;
  if (dashboard.classList.contains("show")) {
    element = document.querySelector(".dashBoardTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY due_date ASC");
    statusValue = "Open";
  }
  else {
    element = document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY due_date ASC");
    statusValue = "Done";
  }
  renderTable(statusValue, element, result);
}

//Function to sort the table data in descending order by due date.
function sortTableDescending() {
  let element, result, statusValue;
  if (dashboard.classList.contains("show")) {
    element = document.querySelector(".dashBoardTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY due_date DESC");
    statusValue = "Open";
  }
  else {
    element = document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY due_date DESC");
    statusValue = "Done";
  }
  renderTable(statusValue, element, result);
}

//Function to unsort the table data.
function unsortedTable() {
  if (dashboard.classList.contains("show")) {
    queryData("Open");
  }
  else {
    queryData("Done");
  }

}

//Function to identify the table, query the corresponding data from the database, and render the table.
function queryData(statusValue) {
  let element, result;
  if (statusValue === "Open") {
    element = document.querySelector(".dashBoardTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Open' ORDER BY task_id DESC");
  } else {
    element = document.querySelector(".completedTasksTable");
    result = dbAPI.selectAll("SELECT task_name AS 'Task name', description AS 'Description', category AS 'Category', priority AS 'Priority', due_date AS 'Due date' FROM taskdata WHERE status='Done' ORDER BY task_id DESC");
  }
  renderTable(statusValue, element, result);
}

//Function to render the table.
function renderTable(statusValue, element, result) {
  if (result.length === 0) {
    element.innerHTML = "";
    return;
  }
  // Construct the header.
  let headerString = '<th></th>';
  result[0].columns.forEach((headerValue) => {
    headerString += `<th>${headerValue}</th>`;
  });
  headerString += '<th> </th>';
  headerString = `<tr">${headerString}</tr>`;

  // Construct the rows.
  let rowString = "", tableRows = "";
  result[0].values.forEach((row) => {
    
    if (statusValue === "Open") {
      rowString = `<td> <input class="form-check-input" type="checkbox" value="" onchange="moveToComplete('${row[0]}')"> </td>`;
    }
    else {
      rowString = '<td> <input class="form-check-input" type="checkbox" value="" checked disabled> </td>';
    }

    row.forEach((cellValue) => {
      rowString += `<td>${cellValue}</td>`;
    });
    rowString += `<td><button class="btn btn-primary" onclick="deleteTask('${row[0]}')">Delete</button></td>`;
    rowString = `<tr>${rowString}</tr>`;
    tableRows += rowString;
  });

  // Add the headers and rows.
  let tableString = headerString + tableRows;

  // Insert the tableString into the table.
  element.innerHTML = tableString;
}
