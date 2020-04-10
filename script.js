"use strict";
/* global m */

// const fetch = require("node-fetch");
// global.fetch = fetch;

var API_SERVER = "https://recipe-app-tba.herokuapp.com/";

// const userbase = require('userbase-js')
// userbase.init({
//   appId: 'YOUR_APP_ID'
// }).then((session) => {
//   // SDK initialized successfully

//   if (session.user) {
//     // there is a valid active session
//     console.log(session.user.username)
//   }
// }).catch((e) => console.error(e))




// Simple helper so we don't have to repeat the API_SERVER everywhere
// _ prefix to indicate it's a helper function
function _api(options) {
  let modifiedOptions = { ...options };
  modifiedOptions["url"] = API_SERVER + modifiedOptions["url"];
  return m.request(modifiedOptions);
}

// https://glitch.com/edit/#!/pouchdb-server?path=server.js:19:0

// const PouchDB = require("pouchdb");
// const express = require("express");
// const bodyParser = require("body-parser");

// var app = express()


// app.use(bodyParser.urlencoded({ extended: true }));
// app.use('/', require('express-pouchdb')(LocalPouchDB))
// var LocalPouchDB = PouchDB.defaults({ prefix: ".data" });
// var db = new LocalPouchDB("recipe-tba");

// function addRecipe(id, title, description){
//   var recipe = {
//     _id : id,
//     title: title,
//     description: description
//   };
//   db.put(recipe, function callback(err,result){
//     if(!err){
//       console.log('Work!');
//     }
//   });
// }

// function showRecipes(){
//   db.allDocs()
// }


// // listen for requests :)
// var listener = app.listen(process.env.PORT, function () {
//   console.log('Your pouchdb is listening on port ' + listener.address().port);
// });




var Api = {
  // This is effectively the "model" of your frontend
  getRecipes: function() {
    return _api({
      method: "GET",
      url: "/recipe"
    });
  },
  getRecipe: function(id) {
    return _api({
      method: "GET",
      url: "/recipe/" + id
    });
  }
};
var t = Api.getRecipes()
console.log("t:", t)


// Begin ViewControllers

var RecipesViewController = {
  list: [],
  recipes: {},
  loadList: function() {
    return Api.getRecipes().then(result => {
      RecipesViewController.list = result;
    });
  },
  loadRecipe: function(recipe_id) {
    return Api.getRecipe(recipe_id).then(result => {
      RecipesViewController.recipes[recipe_id] = result;
    });
  }
};

// Main view of recipes
var RecipesView = {
  username: "",
  password: "",
  
  title: "Recipes",
  oninit: function() {
    return RecipesViewController.loadList();
  },
  
  setUserName: function(name) {
    this.username = name
    console.log("UserName: ", this.username);
  },
  
  setPassword: function(psw) {
    this.password = psw
    console.log("Password: ", this.password);
  },
  
  
  view: function() {
    let that = this;
    
    return [
      m("div", { class: "header" }, [
        m("h1", "Recipe App"),

        // User login inputbox
        m("div", [
          m("h2", "User Login"),
          m("input[type=text]", {oninput: function(e) {that.setUserName(e.target.value)}}),
          m("input[type=password]", {oninput: function(e) {that.setPassword(e.target.value)}})
        ]),

        // Login and register buttons
        m("div", [
          m("button", {
            class: "my-button",
            onclick: function() {
              console.log("Login button clicked")
            }
          },
            "Login"
          ),
          
          m("button", {
            class: "my-button",
            onclick: function() {
              console.log("Register button clicked")
            }
          },
            "Register"
          ),
        ]),

        m("h2", "Recipes List")
      ]),
      m(
        "div",
        { class: "content" },
        _make_recipe_rows(RecipesViewController.list)
      )
    ];
  }
};

var RecipeView = {
  title: "A Recipe",
  view: function(){
    return [
      m("div", { class: "header" },  m("h1", "A title")), 
            m("div",{ class: "content" }, m("h2", "A description"))
              ];
  }
};

function singleRecipeView (recipe){
  m("div", { class: "header" },  m("h1", recipe.title)), m("div",
        { class: "content" }, m("h1", recipe.description))
  
}

function _make_recipe_rows(recipe_list) {
  return m("div", { class: "pure-g" }, recipe_list.map(_make_recipe_row));
}

function makeRecipe(recipe){
  return [
      m("div", { class: "header" },  m("h1", recipe.title)), 
            m("div",{ class: "content" }, m("h2", recipe.description))
              ];

}

// This function is a problem and I dont know why. It correctly displays the title of the recipe but does not display the body
function make_recipe_object(recipe){
  var a_recipe = {
  title: recipe.title,
  view: function(){
    return [
      m("div", 
        { class: "header" },
        m("h1", recipe.title)), 
        m("div",{ class: "content" }, m("h2", recipe.description))
      ];
    }
  };
  return a_recipe;
}

// Recipes list displayed on main page
function _make_recipe_row(recipe) {
  return [
    m(
      "div",
      { class: "pure-u-1-1" },
      m("div", { class: "padded" }, [
        m("h3", recipe.title),
        m("h4", recipe.description)
      ])
    )
  ];
}

// End ViewControllers


var content = document.getElementById("main");

// Test of make recipe function
var RecipeTest = {
  title: "Test",
  oninit: function() {
    return RecipesViewController.loadList();
  },
  view: function(){
    return makeRecipe(RecipesViewController.list[1]);
  }
}

var views = {
  "/recipes": RecipesView,
  "/1": RecipeTest
};

function make_all_recipes(recipe_list){
  console.log(recipe_list)
  var i = 2
    for(const recipe of recipe_list){
      var title = '/'
      views[title.concat(String(i))] = make_recipe_object(recipe)
      console.log(title.concat(String(i)))
      i++
  }
}  

// Needs to wait for recipe controller promise
async function recipe_controller_promise(){
  var x = await RecipesViewController.loadList()
  make_all_recipes(RecipesViewController.list)
  m.route(content, "/2", views);
}
recipe_controller_promise();


m.route(content, "/recipes", views);

// Menu toggle code roughly adapted to Mithril
var layout = document.getElementById("layout"),
  menu = document.getElementById("menu"),
  menuLink = document.getElementById("menuLink");

function toggleClass(element, className) {
  var classes = element.className.split(/\s+/),
    length = classes.length,
    i = 0;

  for (; i < length; i++) {
    if (classes[i] === className) {
      classes.splice(i, 1);
      break;
    }
  }
  // The className is not found
  if (length === classes.length) {
    classes.push(className);
  }

  element.className = classes.join(" ");
}

function toggleAll(e) {
  var active = "active";

  toggleClass(layout, active);
  toggleClass(menu, active);
  toggleClass(menuLink, active);
}

content.onclick = function(e) {
  if (menu.className.indexOf("active") !== -1) {
    toggleAll(e);
  }
};

var MenuView = {
  view: function() {
    return Object.entries(views).map(entry => {
      let route = entry[0];
      let view = entry[1];
      let title = view.title;
      let clazz = "pure-menu-item";
      if (route == m.route.get()) {
        console.log("Selected ", route);
        clazz += " pure-menu-selected";
      }
      return m(
        "li",
        { class: clazz },
        m(
          m.route.Link,
          { href: route, class: "pure-menu-link", onclick: toggleAll },
          title
        )
      );
    });
  }
};

m.mount(document.getElementById("menuList"), MenuView);
