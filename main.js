let inprogressContainer = document.querySelector(".inprogress-container");
let toDoContainer = document.querySelector(".todo-container");
let doneContainer = document.querySelector(".done-container");
let elements = document.getElementsByClassName("element");

let updateBtn = document.querySelector(".update-btn");
let stageRow = document.querySelector(".stage-row");

let form = document.querySelector(".form");

let formInputs = form.elements;
let taskName = formInputs["name"];
let storyPoint = formInputs["story-point"];
let assigner = formInputs["assigner"];
let stage = formInputs["stage"];

let tasksAr = [];

form.addEventListener("submit", AddTask);

function AddTask(e) {
  e.preventDefault();

  let taskObj = {
    name: taskName.value,
    point: Number(storyPoint.value),
    assigner: assigner.value,
    stage: stage.value || "TODO",
    createdAt: new Date(),
  };

  if (!hasOnlySpaces(taskObj.name) && !hasOnlySpaces(taskObj.assigner)) {
    if (!taskObj.point || taskObj.point < 0) {
      /*yesli ya proveru the presence of "taskObj.point" in the main condition, then when "taskObj.point" budet equal to 0, it will display the confirmation message "Please fill in all fields" instead of "1. Story point is empty.\n2. Story point can't be less than 0.\n3. "Story point should not be equal to 0."" That's why I had to check it SEPERATELYY.*/
      confirm(
        "1. Story point is empty.\n2. Story point can't be less than 0.\n3. Story point should nyt be equal to 0."
      );
    } else {
      tasksAr.push(taskObj);
      ClearInputs();
      List();
      updateBtn.classList.add("hide");
      stageRow.classList.add("hide");

      // Save added tasks to local storage + nujno ehse i v upd task toje
      localStorage.setItem("tasks", JSON.stringify(tasksAr));
    }
  } else {
    confirm("Pls fill in all fields.");
  }
}
function hasOnlySpaces(str) {
  return str.trim() === "";
}

function ClearInputs() {
  taskName.value = "";
  storyPoint.value = "";
  assigner.value = "";
  stage.value = "";
}

function List(filterTask) {
  toDoContainer.innerHTML = "";
  inprogressContainer.innerHTML = "";
  doneContainer.innerHTML = "";

  let sortedTask = tasksAr.sort((x, y) => x.createdAt - y.createdAt);

  if (filterTask) {
    sortedTask = filterTask;
  }

  //sozdaem sorted chtobi potom uje proytis po sortirovannomu array
  //..sortirovan etot array po date(: --createdAt)
  
  sortedTask.forEach((task, index) => {
    let taskElement = `<div class="element" data-id="${index}"  draggable="true">${task.name}<span>${task.point}</span></div> `;
    switch (task.stage) {
      case "TODO":
        toDoContainer.innerHTML += taskElement;
        break;

      case "IN_PROGRESS":
        inprogressContainer.innerHTML += taskElement;

        break;
      case "DONE":
        doneContainer.innerHTML += taskElement;
        break;
    }
  });

  Draggable();
}

function Draggable() {
  for (const element of elements) {
    //rabotaem nad i s elementami
    element.addEventListener("dragstart", function (e) {
      let element = e.target;

      //nachinaem vibirat containeri : otkuda drag i kuda drop:

      inprogressContainer.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      //pishem dynamic code

      [inprogressContainer, toDoContainer, doneContainer].forEach(
        (container) => {
          container.addEventListener("dragover", function (e) {
            e.preventDefault();
          });
          container.addEventListener("drop", function (e) {
            e.preventDefault();
            let stage = container.getAttribute("data-name");

            if (element) {
              container.appendChild(element);
              let id = Number(element.getAttribute("data-id"));
              let task = tasksAr[id];
              let updatedTask = { ...task, stage: stage };
              tasksAr.splice(id, 1, updatedTask);
              List();

              localStorage.setItem("tasks", JSON.stringify(tasksAr));
            }

            element = null; //koqda delaesh drop vtoroy raz beretsa prejne dobavlenniy element toje--chtobi predotvratit eto
          });
        }
      );
    });

    element.addEventListener("click", Show);
  }
}

let updatedId = null;

function Show(e) {
  let element = e.target;
  let id = Number(element.getAttribute("data-id"));
  let task = tasksAr[id];

  updatedId = id;

  formInputs["name"].value = task.name;
  formInputs["story-point"].value = task.point;
  formInputs["assigner"].value = task.assigner;
  formInputs["stage"].value = task.stage;

  /*otkuda name/point etc?---
  let taskObj = {
    name: taskName.value,
    point: Number(storyPoint.value),
    assigner: assigner.value,
    stage: "TODO",
     }; --vishe mi sozdali obj a zatem peredali ("push") v array(tasksArr)
     otsyuda i beretsa valu point i tp
  */

  //   updateBtn.classList.remove("hide");

  updateBtn.classList.remove("hide");
  stageRow.classList.remove("hide");
}

updateBtn.addEventListener("click", UpdateTask);

function UpdateTask() {
  let findedTask = tasksAr[updatedId];
  let storyPointValue = Number(storyPoint.value); //Without this i can't perform the check for <>0 ibo it is not recognized as a nmber, potomi i  I had to convert it to num.
  if (
    !hasOnlySpaces(taskName.value) &&
    !hasOnlySpaces(assigner.value) &&
    !hasOnlySpaces(stage.value)
  ) {
    if (!storyPointValue || storyPointValue < 0) {
      confirm(
        "1. Story point is empty.\n2. Story point can't be less than 0.\n3. Story point should nyt be equal to 0."
      );
    } else {
      findedTask.name = taskName.value;
      findedTask.point = storyPoint.value;
      findedTask.assigner = assigner.value;
      findedTask.stage = stage.value;

      tasksAr.splice(updatedId, 1, findedTask); //udalaet odnu i vmesto neqo dobavlaet findedt
      List();
      ClearInputs();
      updateBtn.classList.add("hide");
      stageRow.classList.add("hide");

      localStorage.setItem("tasks", JSON.stringify(tasksAr));
      /*  yesli ya uberu eto otsuda , to vse IZMENENIYA (updatetsk) budut poterani.. pri refresh(/next page load) will be restored iz sostoyaniya  soxranennoqo v LOCALSTORAGE DO modification .
  to est izmeneniya ne soxranatsa .
 task will be обновлена в памяти (в массиве tasksAr), но не будет обновлена в хранилище localStorage*/
      updatedId = null;
    }
  } else {
    confirm("again fill in all fields.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Retrieve iz lstorage
  let storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    tasksAr = JSON.parse(storedTasks);
    List(); // mi delaem Refresh task list
  }
});

let allTasksBtn = document.querySelector(".allTasks-btn");
let assignerButtons = document.querySelectorAll(".assigner-btn");

allTasksBtn.addEventListener("click", function () {
  List();
});

assignerButtons.forEach((button) => {
  button.addEventListener("click", function () {
    let assignerName = button.getAttribute("data-assigner")|| button.textContent;;
    let filteredTasks = tasksAr.filter(task => task.assigner === assignerName);
    List(filteredTasks);
    console.log(filteredTasks);
  });
});

