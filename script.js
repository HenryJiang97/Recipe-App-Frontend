"use strict";
/* global m */

var API_SERVER = "https://mockery-recipe.herokuapp.com";

// Simple helper so we don't have to repeat the API_SERVER everywhere
// _ prefix to indicate it's a helper function
function _api(options) {
  let modifiedOptions = { ...options };
  modifiedOptions["url"] = API_SERVER + modifiedOptions["url"];
  return m.request(modifiedOptions);
}

var Api = { // This is effectively the "model" of your frontend
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
    })
  }
};

var RecipesView = {
  title: "Recipes",
  oninit: function() {
    return RecipesViewController.loadList();
  },
  view: function() {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Recipes"),
        m("h2", "Recipes")
      ]),
      m(
        "div",
        { class: "content" },
        _make_recipe_rows(RecipesViewController.list)
      )
    ];
  }
};

function _make_recipe_rows(recipe_list) {
  return m("div", { class: "pure-g" }, recipe_list.map(_make_recipe_row));
}

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

var views = {
  "/recipes": RecipesView
};

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
