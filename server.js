const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();

// * setup bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());

// * setup handlebars
const exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// * setup public
app.use(express.static("public"));

// * setup controller and router
const db = require("./models");
const controller = require("./controllers/controller")(db);

const router = express.Router();
require("./routes/routes")(router, controller);

app.use("/", router);

// include "force: true" if necessary
const options = {};

db.sequelize
  .sync(options)
  .then(() => {
    console.log("Database sync successful.");
    // UNCOMMENT THE LINE BELOW TO INSERT SEED VALUES UPON SERVER START
    // return seedValues();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server started up successfully. Listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error(error);
  });

function seedValues() {
  const Burger = db.burger;
  const Customer = db.customer;

  const burgerArr = [
    { burger_name: "Krabby Patty" },
    { burger_name: "Quarter Pounder" },
    { burger_name: "Royale with Cheese" },
    { burger_name: "Whopper" }
  ];
  const customerArr = [
    { customer_name: "Spongebob" },
    { customer_name: "Patrick" },
    { customer_name: "Squidward" },
    { customer_name: "Sandy" }
  ];

  return Promise.all([
    Burger.bulkCreate(burgerArr),
    Customer.bulkCreate(customerArr)
  ])
    .then(() => {
      console.log("Successfully inserted initial burgers.");
      console.log("Successfully inserted initial customers.");
      return Promise.all([Burger.findAll(), Customer.findAll()]);
    })
    .then(([burgers, customers]) => {
      burgers.forEach(burger => {
        burger.setCustomers(customers);
      });
      console.log("Successfully setup associations.");
    });
}
