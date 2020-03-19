"use strict";
/* global m */

var API_SERVER = "https://mockery-recipe.herokuapp.com";

// Simple helper so we don't have to repeat the API_SERVER everywhere
// _ prefix to indicate it shouldn't be used often
function _api(options) {
  let modifiedOptions = { ...options };
  modifiedOptions["url"] = API_SERVER + modifiedOptions["url"];
  return m.request(modifiedOptions);
}

var Api = {
  getRecipes: function() {
    return _api({
      method: "GET",
      url: "/recipe"
    })
  },
  getRecipe: function(id) {
    return _api({
      method: "GET",
      url: "/recipe/" + id
    })
  }
}

var RecipesViewController = {
  list: [],
  loadList: function() {
    return Api.getRecipes().then((result) => {
      RecipesViewController.list = result;
    })
  }
}

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
      m("div", { class: "content" }, make_recipe_rows(RecipesViewController.list))
    ];
  }
};

function make_recipe_rows(recipe_list) {
  return m("div", { class: "pure-g" }, recipe_list.map(make_recipe_row));
}

function make_recipe_row(recipe) {
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

var Toppings = {
  list: [],
  loadList: function() {
    return m
      .request({
        method: "GET",
        url: "/api/topping"
      })
      .then(function(result) {
        Toppings.list = result;
      });
  }
};

var make_topping_row = function(topping) {
  return [
    m(
      "div",
      { class: "pure-u-1-4" },
      m(
        "div",
        { class: "padded" },
        m("img", {
          class: "pure-img",
          src: topping.image.urls.small,
          alt: topping.name,
          style: {
            "object-fit": "cover",
            height: "133px",
            width: "100%"
          }
        })
      )
    ),
    m(
      "div",
      { class: "pure-u-3-4" },
      m("div", { class: "padded" }, [
        m("h3", topping.name),
        m("h4", topping.description)
      ])
    )
  ];
};

var make_topping_rows = function(toppings_list) {
  return m("div", { class: "pure-g" }, toppings_list.map(make_topping_row));
};

var ToppingsPage = {
  oninit: function() {
    return Toppings.loadList();
  },
  view: function() {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Pizza"),
        m("h2", "Toppings")
      ]),
      m("div", { class: "content" }, make_topping_rows(Toppings.list))
    ];
  }
};

var format_currency = function(cents) {
  var dec = cents % 100;
  if (dec < 10) {
    dec = "0" + dec;
  }
  var dol = Math.floor(cents / 100);
  return "$" + dol + "." + dec;
};

var Prices = {
  list: [],
  pizzas: [],
  addons: [],
  loadList: function() {
    return m
      .request({
        method: "GET",
        url: "/api/pricing"
      })
      .then(function(result) {
        Prices.pizzas = result.filter(item => !item.addon);
        Prices.addons = result.filter(item => item.addon);
        Prices.list = result;
      });
  }
};

var price_addons = function(size) {
  return Prices.addons.map(function(addon) {
    var price = addon.price[size];
    return m(
      "h5",
      addon.description.replace("${PRICE}", format_currency(price))
    );
  });
};

var make_price_row = function(price) {
  var size = Object.keys(price.price)[0];
  var base_price = price.price[size];
  return m(
    "div",
    { class: "pure-u-1-1" },
    m(
      "div",
      { class: "padded" },
      m(
        "h4",
        [
          price.description.replace("${PRICE}", format_currency(base_price))
        ].concat(price_addons(size))
      )
    )
  );
};

var make_pricing_rows = function(prices_list) {
  return m("div", { class: "pure-g" }, prices_list.map(make_price_row));
};

var PricesPage = {
  oninit: Prices.loadList,
  view: function() {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Pizza"),
        m("h2", "Prices")
      ]),
      m("div", { class: "content" }, make_pricing_rows(Prices.pizzas))
    ];
  }
};

var Sizing = {
  list: [],
  loadList: function() {
    return m
      .request({
        method: "GET",
        url: "/api/size"
      })
      .then(function(result) {
        Sizing.list = result.map(result => {
          result["total_calories"] =
            result.slices.count * result.slices.calories;
          return result;
        });
      });
  }
};

var make_sizing_row = function(sizing) {
  return m("tr", [
    m("td", sizing.name),
    m("td", sizing.size_inches),
    m("td", sizing.slices.count),
    m("td", sizing.slices.calories),
    m("td", sizing.total_calories)
  ]);
};

var make_sizing_table = function(sizing_list) {
  return m("table", { class: "pure-table" }, [
    m("thead", [
      m("tr", [
        m("th", "Name"),
        m("th", "Inches"),
        m("th", "Slices"),
        m("th", "Calories/Slice"),
        m("th", "Total Calories")
      ])
    ]),
    m("tbody", sizing_list.map(make_sizing_row))
  ]);
};

var SizesPage = {
  oninit: Sizing.loadList,
  view: function() {
    return [
      m("div", { class: "header" }, [
        m("h1", "Mockery Pizza"),
        m("h2", "Sizes")
      ]),
      m("div", { class: "content" }, make_sizing_table(Sizing.list))
    ];
  }
};

var BuildPage = ToppingsPage;

var root = document.getElementById("main");

var views = {
  "/toppings": RecipesView,
  "/prices": RecipesView,
  "/sizes": RecipesView,
  "/build": RecipesView
};

m.route(root, "/sizes", views);

var MenuView = {
  view: function() {
    return Object.entries(views).map((entry) => {
      let route = entry[0];
      let view = entry[1];
      let title = view.title;
      return m("li", {class: "pure-menu-item"},
              m("a", {href: "#!" + route, class: "pure-menu-link"}), title);
    })
    
//     <li class="pure-menu-item">
//               <a href="#!/toppings" class="pure-menu-link">Toppings</a>
//             </li>
//             <li class="pure-menu-item pure-menu-selected">
//               <a href="#!/prices" class="pure-menu-link">Prices</a>
//             </li>

//             <li class="pure-menu-item">
//               <a href="#!/sizes" class="pure-menu-link">Sizes</a>
//             </li>

//             <li class="pure-menu-item">
//               <a href="#!/build" class="pure-menu-link">Build</a>
//             </li>

  }
}

m.mount(document.getElementById("menuList"), MenuView);

/* Menu JS */
(function(window, document) {
  var layout = document.getElementById("layout"),
    menu = document.getElementById("menu"),
    menuLink = document.getElementById("menuLink"),
    content = document.getElementById("main");

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

    e.preventDefault();
    toggleClass(layout, active);
    toggleClass(menu, active);
    toggleClass(menuLink, active);
  }

  menuLink.onclick = function(e) {
    toggleAll(e);
  };

  content.onclick = function(e) {
    if (menu.className.indexOf("active") !== -1) {
      toggleAll(e);
    }
  };
})(this, this.document);
