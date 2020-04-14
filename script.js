"use strict";
/* global m, userbase */

var API_SERVER = "https://recipe-app-tba.herokuapp.com/";

// Initialize userbase
userbase
  .init({
    appId: "44840daa-e0bc-44aa-8cf2-c89b0acdbffd"
  })
  .then(session => {
    // SDK initialized successfully
    console.log("UserBase SDK loaded");
    if (session.user) {
      // there is a valid active session
      console.log(session.user.username);
    }
  })
  .catch(e => console.error(e));

//////////////////////////////////////////////////////////////////////////////////////////
// APIs

// Simple helper so we don't have to repeat the API_SERVER everywhere
// _ prefix to indicate it's a helper function
function _api(options) {
  let modifiedOptions = { ...options };
  modifiedOptions["url"] = API_SERVER + modifiedOptions["url"];
  return m.request(modifiedOptions);
}

// APIs to connect to backend
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
      url: "/recipe/:id",
      params: { id: id }
    });
  },
  addRecipe: function(recipe) {
    return _api({
      method: "POST",
      url: "/recipe",
      body: recipe // recipe should be a fully-formed recipe object with matching field names
    });
  },
  updateRecipe: function(recipe) {
    return _api({
      method: "PUT",
      url: "/recipe",
      body: recipe // recipe should be a fully-formed recipe object with matching field names
    });
  },
  deleteRecipe: function(recipe) {
    return _api({
      method: "DELETE",
      url: "/recipe",
      body: recipe // recipe should be a fully-formed recipe object with matching field names
    });
  },

  getUsers: function() {
    return _api({
      method: "GET",
      url: "/user"
    });
  },
  getUsers: function(id) {
    return _api({
      method: "GET",
      url: "/user/:id",
      params: { id: id }
    });
  },
  addUser: function(user) {
    return _api({
      method: "POST",
      url: "/user",
      body: user // user should be a fully-formed user object with matching field names
    });
  },
  updateUser: function(user) {
    return _api({
      method: "PUT",
      url: "/user",
      body: user // user should be a fully-formed user object with matching field names
    });
  },
  deleteUser: function(user) {
    return _api({
      method: "DELETE",
      url: "/user",
      body: user // user should be a fully-formed user object with matching field names
    });
  }
};

////////////////////////////////////////////////////////////////////////////////////////
// Build objects (Recipes, Users, Reviews)

// Make new User
function makeNewUser(username, password) {
  return {
    id: null,
    userName: username,
    email: null,
    password: password,
    favoriteRecipe: null,
    userPreferences: null
  };
}

// Make new Recipe
function makeNewRecipe(name) {
  return {
    id: null,
    title: name,
    description: null,
    style: null,
    ratings: null,
    directions: null,
    averageRating: 0,
    yield: 0,
    prepTime: 0,
    waitTime: 0,
    totalTime: 0,
    cookTime: 0,
    tag: null,
    author: null
  };
}

// Api.addRecipe({
//   "id" : null,
//   "title" : "BBQ Chicken",
//   "description" : "Fresh grilled Barbecue Chicken",
//   "style" : null,
//   "ratings" : null,
//   "directions" : null,
//   "averageRating" : 0,
//   "yield" : 0,
//   "prepTime" : 0,
//   "waitTime" : 0,
//   "totalTime" : 0,
//   "cookTime" : 0,
//   "tag" : null,
//   "author" : null
// }).then(() => {
//   console.log("Created BBQ Chicken")
// });

Api.addUser({
  id: null,
  userName: "gabriel",
  email: null,
  password: "3141592",
  favoriteRecipe: null,
  userPreferences: null
});

//////////////////////////////////////////////////////////////////////////////////////////
// ViewControllers

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

//  "/recipes/:recipe_id": SingleRecipeView,
var SingleRecipeView = {
  oninit: function(vnode) {
    let recipe_id = vnode.attrs.recipe_id;
    return RecipesViewController.loadRecipe(recipe_id);
  },
  view: function(vnode) {
    let recipe_id = vnode.attrs.recipe_id;
    let recipe = RecipesViewController.recipes[recipe_id];
    if (recipe === undefined) {
      RecipesViewController.loadRecipe(recipe_id);
      return;
    }
    return [
      m("div", { class: "header" }, m("h1", recipe.title)),
      m("div", { class: "content" }, m("h2", recipe.description)),
      m(
        "div",
        { class: "content" },
        m("h2", "Total Time: " + recipe.totalTime + "  Yield: " + recipe.yield)
      ),
      m("div", { class: "content" }, m("h2", "Directions " + recipe.directions))
    ];
  }
};

// Login info
var username = "";
var password = "";
var userLoggedin = "";
var signedin = false;

// Main view of recipes
var RecipesView = {
  title: "Recipes",
  oninit: function() {
    return RecipesViewController.loadList();
  },

  view: function() {
    return [
      m("div", { class: "header" }, m("h1", "Recipe App")),
      _make_login_form(),
      m(
        "div",
        m("h2", { class: "header" }, "Recipes List"),
        m(
          "div",
          { class: "content" },
          _make_recipe_rows(RecipesViewController.list)
        )
      )
    ];
  }
};

////////////////////////////////////////////////////////////////////
// User authentication

function _make_button(text, onclick) {
  return m(
    "button",
    {
      class: "my-button",
      onclick: onclick
    },
    text
  );
}

function setUserName(name) {
  username = name;
  // console.log("UserName: ", this.username);
}

function setPassword(psw) {
  password = psw;
  // console.log("Password: ", this.password);
}

function register(username, password) {
  userbase
    .signUp({
      username: username,
      password: password
    })
    .then(user => {
      // user account created
      alert("Registered");
      // Add user to database
      Api.addUser(makeNewUser(username, password));
    })
    .catch(e => alert(e));
}

function signin(username, password) {
  userbase
    .signIn({
      username: username,
      password: password
    })
    .then(user => {
      // user logged in
      alert("Signed in");
      signedin = true;
      userLoggedin = username;
      username = "";
    })
    .catch(e => alert(e));
}

function signout() {
  userbase
    .signOut()
    .then(() => {
      // user logged out
      alert("Signed out");
      signedin = false;
      userLoggedin = "";
    })
    .catch(e => alert(e));
}

function _make_login_form() {
  return m(
    "div",
    m("div", { class: "header" }, [
      // User login inputbox
      m("div", [
        m("h2", "User Login"),
        m("input[type=text]", {
          oninput: function(e) {
            setUserName(e.target.value);
          }
        }),
        m("input[type=password]", {
          oninput: function(e) {
            setPassword(e.target.value);
          }
        })
      ]),

      // Login and register buttons
      m("div", [
        _make_button("Login", function() {
          signin(username, password);
        }),
        _make_button("Register", function() {
          register(username, password);
        })
      ])
    ]),

    m("div", { class: "header" }, [
      m("h2", `Welcome ${userLoggedin}`),
      _make_button("Sign out", function() {
        signout();
      })
    ])
  );
}

///////////////////////////////////////////////////////////////////////////////////

var RecipeView = {
  title: "A Recipe",
  view: function() {
    return [
      m("div", { class: "header" }, m("h1", "A title")),
      m("div", { class: "content" }, m("h2", "A description"))
    ];
  }
};

function singleRecipeView(recipe) {
  m("div", { class: "header" }, m("h1", recipe.title)),
    m("div", { class: "content" }, m("h1", recipe.description));
}

function _make_recipe_rows(recipe_list) {
  return m("div", { class: "pure-g" }, recipe_list.map(_make_recipe_row));
}

function makeRecipe(recipe) {
  return [
    m("div", { class: "header" }, m("h1", recipe.title)),
    m("div", { class: "content" }, m("h2", recipe.description))
  ];
}

// This function is a problem and I dont know why. It correctly displays the title of the recipe but does not display the body
function make_recipe_object(recipe) {
  var a_recipe = {
    title: recipe.title,
    view: function() {}
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
        m(
          "h3",
          m(
            "a",
            {
              href: "#!/recipes/" + recipe.id
            },
            recipe.title
          )
        ),
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
  view: function() {
    return makeRecipe(RecipesViewController.list[1]);
  }
};

var views = {
  "/recipes": RecipesView,
  "/recipes/:recipe_id": SingleRecipeView
};

function make_all_recipes(recipe_list) {
  console.log(recipe_list);
  var i = 2;
  for (const recipe of recipe_list) {
    var title = "/";
    views[title.concat(String(i))] = make_recipe_object(recipe);
    console.log(title.concat(String(i)));
    i++;
  }
}

// Needs to wait for recipe controller promise
// async function recipe_controller_promise() {
//   var x = await RecipesViewController.loadList();
//   make_all_recipes(RecipesViewController.list);
//   m.route(content, "/2", views);
// }
// recipe_controller_promise();

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

function _make_recipe_links(recipeList) {
  if (recipeList === undefined) {
    return [];
  }

  return recipeList.map(entry => {
    let clazz = "pure-menu-item";
    let route = "#!/recipes/" + entry.id;
    if (route == m.route.get()) {
      console.log("Selected ", route);
      clazz += " pure-menu-selected";
    }

    return m(
      "li",
      { class: clazz },
      m(
        "a",
        { href: route, class: "pure-menu-link", onclick: toggleAll },
        entry.title
      )
    );
  });
}

var MenuView = {
  oninit: function() {
    return RecipesViewController.loadList();
  },
  view: function() {
    return Object.entries(views)
      .map(entry => {
        let route = entry[0];
        let view = entry[1];
        let title = view.title;
        if (title === undefined) return;
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
      })
      .concat(_make_recipe_links(RecipesViewController.list));
  }
};

m.mount(document.getElementById("menuList"), MenuView);
