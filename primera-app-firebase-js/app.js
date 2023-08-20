// jshint esversion: 8
import { login, logout } from "./auth.js";
import { insert, getItems, update, deleteDoc } from "./firestore.js";
import { getUUID } from "./utils.js";
let currentUser;

let todos = [];

const buttonLogin = document.getElementById("button-login");
const buttonLogout = document.getElementById("button-logout");
const todoInput = document.getElementById("todo-input");
const todoForm = document.getElementById("todo-form");
const userInfo = document.getElementById("user-info");
const todosContainer = document.getElementById("todos-container");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    var uid = user.uid;
    currentUser = user;
    init();
  } else {
    console.log('No user logged in');
    hideIU();
  }
});

todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  console.log('YUPIIIIIIIIIIIII');
  const text = todoInput.value;
  if (text !== "") {
    addTodo(text);
    todoInput.value = '';
  }
});

buttonLogin.addEventListener("click", async (e) => {
  try {
    currentUser = await login();
    init();
  } catch (error) {
    console.error(error);
  }
});

buttonLogout.addEventListener("click", (e) => {
  logout();
  //localStorage.removeItem("user");
  hideIU();
});

async function init() {
  //localStorage.setItem("user", JSON.stringify(currentUser));
  buttonLogin.classList.add("hidden");
  buttonLogout.classList.remove("hidden");
  todoForm.classList.remove("hidden");
  userInfo.innerHTML = `
    <img src="${currentUser.photoURL}" width="32" />
    <span>${currentUser.displayName}</span>
  `;

  loadTodos();
}

async function addTodo(text) {
  try {
    const todo = {
      id: getUUID(),
      text: text,
      completed: false,
      userid: currentUser.uid,
    };
    const response = await insert(todo);
    loadTodos();
  } catch (error) {
    console.error(error);
  }
}

async function loadTodos() {
  todosContainer.innerHTML = "";
  todos = [];

  try {
    const response = await getItems(currentUser.uid);

    todos = [...response];
    renderTodos();
  } catch (error) {
    console.error(error);
  }
}

function renderTodos() {
  let html = "";
  todos.forEach((todo) => {
    html += `
      <li>
        <input type="checkbox" id="${todo.id}" ${
      todo.completed ? "checked" : ""
    } />
        <label for="${todo.id}">${todo.text}</label>
        <button class="delete-button" data-id="${todo.id}">Delete</button>
      </li>
    `;
  });

  todosContainer.innerHTML = html;

  document
    .querySelectorAll('#todos-container input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", async (e) => {
        const id = e.target.id;
        try {
          await update(id, e.target.checked);
        } catch (error) {
          console.error(error);
        }
      });
    });

  document
    .querySelectorAll('#todos-container .delete-button')
    .forEach((button) => {  
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        try {
          await deleteDoc(id);
          loadTodos();
        } catch (error) {
          console.error(error);
        }
      });
    });
    
} //rendertodos

function hideIU () {
  buttonLogin.classList.remove("hidden");
  buttonLogout.classList.add("hidden");
  todoForm.classList.add("hidden");
  todosContainer.innerHTML = "";
}

