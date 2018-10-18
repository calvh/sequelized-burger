module.exports = db => {
  const Op = db.Sequelize.Op;
  const sequelize = db.sequelize;
  const Devoured = db.devoured;
  const Burger = db.burger;
  const Customer = db.customer;

  const controller = {
    // * render main page
    render_all(req, res) {
      Promise.all([
        // * get all burgers and associated customers
        Burger.findAll({
          include: [
            {
              model: Customer,
              attributes: {
                exclude: ["created_at", "updated_at"]
              },
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ],
          attributes: {
            exclude: ["created_at", "updated_at"]
          }
        }),
        // * get all customers and associated burgers
        Customer.findAll({
          include: [
            {
              model: Burger,
              attributes: {
                exclude: ["created_at", "updated_at"]
              },
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ],
          attributes: { exclude: ["created_at", "updated_at"] }
        })
      ])
        .then(([dbBurgers, dbCustomers]) => {
          // * get raw values
          let customers = dbCustomers.map(customer => customer.dataValues);
          let burgers = dbBurgers.map(burger => burger.dataValues);

          // * add "devoured" and "sum_devoured" properties to each burger
          burgers.forEach(burger => {
            burger.devoured = burger.customers.length > 0;
            burger.sum_devoured = burger.customers.reduce(
              (accumulator, currVal) => {
                return accumulator + currVal.devoured.total_devoured;
              },
              0
            );
          });

          // * add "sum_devoured" property to each customer
          customers.forEach(customer => {
            customer.sum_devoured = customer.burgers.reduce((acc, currVal) => {
              return acc + currVal.devoured.total_devoured;
            }, 0);
          });

          // * calculate total number of burgers eaten
          let totalBurgers = burgers.reduce((acc, currVal) => {
            return acc + currVal.sum_devoured;
          }, 0);

          let topCustomer, topBurger;

          // * sort burgers and customers by sum_devoured
          if (totalBurgers === 0) {
            topCustomer = "No burgers eaten yet!";
            topBurger = "No burgers eaten yet!";
          } else {
            function sortDesc(inputArr, prop) {
              // input: array of objects
              // prop: property to be compared
              // returns: array of objects sorted by property in descending order
              let resultArr = [inputArr[0]];
              inputArr.slice(1).forEach(obj => {
                let maxVal = resultArr[0][prop];
                if (obj[prop] >= maxVal) {
                  resultArr.unshift(obj);
                } else {
                  resultArr.push(obj);
                }
              });

              return resultArr;
            }

            topCustomer = sortDesc(customers, "sum_devoured");
            topBurger = sortDesc(burgers, "sum_devoured");
          }

          const data = {
            customers: customers,
            burgers: burgers,
            topBurger: topBurger,
            topCustomer: topCustomer,
            totalBurgers: totalBurgers
          };

          res.render("index", data);
        })
        .catch(error => {
          console.error(error);
          res.status(500).end();
        });
    },

    burger_list_get(req, res) {
      const id = req.params.id;
      if (id) {
        Burger.findOne({
          where: { id: id },
          include: [
            {
              model: Customer,
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ]
        })
          .then(dbBurger => {
            console.log(`Returning JSON of burger ID ${id}`);
            res.json(dbBurger);
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      } else {
        Burger.findAll({
          include: [
            {
              model: Customer,
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ]
        })
          .then(dbBurgers => {
            console.log("Returning JSON of all burgers...");
            res.json(dbBurgers);
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      }
    },

    burger_create_post(req, res) {
      const burgerName = req.body.burger_name;
      Promise.all([
        Burger.create({ burger_name: burgerName }),
        Customer.findAll()
      ])
        .then(([newBurger, dbCustomers]) => {
          return newBurger.setCustomers(dbCustomers);
        })
        .then(() => {
          console.log("Successfully associated new burger with all customers.");
          console.log("Successfully inserted new burger.");
          res.status(200).end();
        })
        .catch(error => {
          console.error(error);
          res.status(500).end();
        });
    },

    burger_update_put(req, res) {
      const burgerID = req.params.id;
      const customerIDs = req.body.customers;
      const reset = req.body.reset;

      if (burgerID) {
        Burger.findOne({ where: { id: burgerID } })
          .then(dbBurger => {
            if (customerIDs) {
              return dbBurger.getCustomers({
                where: { id: { [Op.in]: customerIDs } }
              });
            } else {
              return dbBurger.getCustomers();
            }
          })
          .then(dbCustomers => {
            dbCustomers.forEach(dbCustomer => {
              if (reset) {
                // * reset a burger (and all associated customers)
                dbCustomer.devoured.total_devoured = 0;
                dbCustomer.devoured.save();
              } else {
                // * devour a burger
                dbCustomer.devoured.increment("total_devoured", { by: 1 });
              }
            });
            res.status(200).end();
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      } else {
        // * reset all burgers (and reset all associated customers)
        Devoured.update(
          { total_devoured: 0 },
          { where: { total_devoured: { [Op.ne]: 0 } } }
        )
          .then(updatedRows => {
            console.log(`Successfully reset ${updatedRows} rows.`);
            res.status(200).end();
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      }
    },

    customer_list_get(req, res) {
      const id = req.params.id;
      if (id) {
        Customer.findOne({
          where: { id: id },
          include: [
            {
              model: Burger,
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ]
        })
          .then(dbCustomer => {
            console.log(`Returning JSON of customer ID ${id}`);
            res.json(dbCustomer);
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      } else {
        Customer.findAll({
          include: [
            {
              model: Burger,
              through: {
                attributes: ["total_devoured"],
                where: { total_devoured: { [Op.gt]: 0 } }
              }
            }
          ]
        })
          .then(dbCustomers => {
            console.log("Returning JSON of all burgers...");
            res.json(dbCustomers);
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      }
    },

    customer_create_post(req, res) {
      const customerName = req.body.customer_name;
      console.log("customerName: ", customerName);
      Promise.all([
        Customer.create({ customer_name: customerName }),
        Burger.findAll()
      ])
        .then(([newCustomer, dbBurgers]) => {
          return newCustomer.setBurgers(dbBurgers);
        })
        .then(() => {
          console.log("Successfully associated new customer with all burgers.");
          console.log("Successfully inserted new customer.");
          res.status(200).end();
        })
        .catch(error => {
          console.error(error);
          res.status(500).end();
        });
    },

    customer_update_put(req, res) {
      const customerID = req.params.id;
      const burgerIDs = req.body.burgersIDs;
      const reset = req.body.reset;

      if (customerID) {
        Customer.findOne({ where: { id: customerID } })
          .then(dbCustomer => {
            if (burgerIDs) {
              return dbCustomer.getBurgers({
                where: { id: { [Op.in]: burgerIDs } }
              });
            } else {
              return dbCustomer.getBurgers();
            }
          })
          .then(dbBurgers => {
            dbBurgers.forEach(dbBurger => {
              if (reset) {
                // * reset a customer (and all associated burgers)
                dbBurger.devoured.total_devoured = 0;
                dbBurger.devoured.save();
              } else {
                // * devour a burger
                dbBurger.devoured.increment("total_devoured", { by: 1 });
              }
            });
            res.status(200).end();
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      } else {
        // * reset all customers (and reset all associated burgers)
        Devoured.update(
          { total_devoured: 0 },
          { where: { total_devoured: { [Op.ne]: 0 } } }
        )
          .then(updatedRows => {
            console.log(`Successfully reset ${updatedRows} rows.`);
            res.status(200).end();
          })
          .catch(error => {
            console.error(error);
            res.status(500).end();
          });
      }
    }
  };

  return controller;
};
