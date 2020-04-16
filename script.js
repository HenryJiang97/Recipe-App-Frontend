"use strict";
/* global m, userbase */

var API_SERVER = "https://recipe-app-tba.herokuapp.com/";


var userLoggedin = "";
var signedin = false;
// Initialize userbase
userbase
  .init({
    appId: "44840daa-e0bc-44aa-8cf2-c89b0acdbffd"
  })
  .then(session => {
    // SDK initialized successfully
    // console.log("UserBase SDK loaded");
    if (session.user) {
      // there is a valid active session
      userLoggedin = session.user.username;
      signedin = true;
      console.log("Signed in");
      console.log("User Logged in: ", session.user.username);
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
  getUser: function(id) {
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
function makeNewRecipe(author, name, description, style, ratings) {
  return {
    id: null,
    title: name,
    description: description,
    style: style,
    ratings: ratings,
    directions: null,
    averageRating: 0,
    yield: 0,
    prepTime: 0,
    waitTime: 0,
    totalTime: 0,
    cookTime: 0,
    tag: null,
    author: author
  };
}

// Api.addRecipe({
//   "id" : null,
//   "title" : "Chicken Bake",
//   "description" : "Baked Chicken",
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

Api.addRecipe({
  id: null,
  title: "Chicken",
  description: "Hahaha",
  style: "American",
  ratings: "4.5",
  directions: null,
  averageRating: 0,
  yield: 0,
  prepTime: 0,
  waitTime: 0,
  totalTime: 0,
  cookTime: 0,
  tag: null,
  author: "henry"
}).then(() => {
  console.log("Created BBQ Chicken")
});

// Api.addUser({
//   id: null,
//   userName: "gabriel",
//   email: null,
//   password: "3141592",
//   favoriteRecipe: null,
//   userPreferences: null
// }).then(() => {
//   console.log("Created BBQ Chicken")
// });

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

    // var ingridents = recipe.directions.map(direction =>
    //   m("div", { class: "content" }, m("h2", direction.name), [m("h3", direction.description)])
    // );
    var total_time = recipe.totalTime / 60;
    total_time = total_time.toFixed(2);
    var recipe_items = [
      m("div", { class: "header" }, m("h1", recipe.title)),
      m(
        "div",
        { class: "content" },
        m(
          "h2",
          "Total Time: " +
            total_time +
            " minutes" +
            "    Yield: " +
            recipe.yield +
            "    Author: " +
            recipe.author
        )
      ),
      m("div", { class: "content" }, m("h3", recipe.description))
      
    ];
    if (recipe.directions == null) {
      return recipe_items;
    }
    // var ingridentList = recipe.direction.map(direction=> direction)
    var descriptionSteps = recipe.directions.map(direction =>
      m("div", { class: "content" }, [
        m("h2", direction.name),
        m("h3", direction.description)
      ])
    );
    var ingredients_list = createIngredients(recipe);
    recipe_items.push(m("div", { class: "content" }, m("h1", "Ingredients ")))
    var recipeIngredients = recipe_items.concat(ingredients_list);
    recipeIngredients.push(m("div", { class: "content" }, m("h1", "Directions ")))
    var recipeDescriptionsDirections = recipeIngredients.concat(descriptionSteps);
    return recipeDescriptionsDirections;
  }
};

function createIngredients(recipe){
  var ingredient_list = new Array();
  for(const direction of recipe.directions){
    if(direction.ingredients != null){
      for(const ingredient of direction.ingredients){
        var html_ingredient =  m("div", { class: "content" }, m("h3", ingredient.amount + " " + ingredient.unit + " " + ingredient.name))
        ingredient_list.push(html_ingredient)
      }
    }
  }
  return ingredient_list;
}

// Login info
var username = "";
var password = "";

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
}

function setPassword(psw) {
  password = psw;
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
    ]),

    m("div", { class: "header"}, 
      m("h2", "You can add new recipe here"),
      _make_add_recipe_form("Add new Recipe")
    )
  );
}


///////////////////////////////////////////////////////////////////////////////////
// Add new recipe by users

var styleList = [{ name: "American", id: "american"}, { name: "Chinese", id: "chinese" }, { name: "Japanese", id: "japanese" }, { name: "Korean", id: "korean" }, ];
var ratings = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];


var styleDropDown = {
  controller: function () {
    var ctrl = this
    ctrl.data = m.prop(styleList)
    ctrl.selectedId = m.prop()
  },
  view: function (ctrl) {
    return m('select', { onchange: m.withAttr('value', ctrl.selectedId) }, [
      ctrl.data().map(function(style) {
        return m('option', { value: style.id }, style.name)
      })
    ])
  }
}

var name = "";
var description = "";
var style = "";
var rating = 0.0;

function _make_add_recipe_form(label) {
  return m(
    "div",
    [
      m("div", [
        m("div", [
          m("p", "Name"),
          m("input[type=text]", {
              oninput: function(e) {
                name = e.target.value;
              }
            }
          )
        ]),
        m("div", [
          m("p", "Description: "),
          m("input[type=text]", {
            oninput: function(e) {
              description = e.target.value;
            }
          }
        )
        ]),
        m("div", [
          m("p", "Style"),
          m("input[type=text]", {
            oninput: function(e) {
              style = e.target.value;
            }
          }
        )
        ]),
        m("div", [
          m("p", "Rating"),
          m("input[type=text]", {
            oninput: function(e) {
              rating = e.target.value;
            }
          }
        )
        ]),
      ]),
      _make_button(label, function() {
        console.log("Add recipe button clicked");
        console.log(name);
        console.log(description);
        console.log(style);
        console.log(rating);
        var newRecipe = makeNewRecipe(userLoggedin, name, description, style, rating);
        console.log(newRecipe);

        // If signed in, post the new recipe to the database
        if (signedin == true) {
          Api.addRecipe(
            newRecipe
          ).then(() => {
              console.log(`Added ${name}`)
            });
        } else {
          alert("Please sign in!");
        }
      }),
    ]
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
          // console.log("Selected ", route);
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
