module.exports = (router, controller) => {
  // -----------------------------  MAIN ROUTE  -----------------------------

  // * GET all and render
  router.get("/", controller.render_all);

  // ----------------------------  BURGER ROUTES  ---------------------------

  // * GET one or all burgers
  router.get("/api/burgers/:id?", controller.burger_list_get);

  // * POST create new burger
  router.post("/burgers", controller.burger_create_post);

  // * PUT - (devour or reset) (one or all) burgers
  router.put("/burgers/:id?", controller.burger_update_put);

  // ------------------------------  CUSTOMER  ------------------------------

  // * GET one or all customers
  router.get("/api/customers/:id?", controller.customer_list_get);

  // * POST new customer
  router.post("/customers", controller.customer_create_post);

  // * PUT - (devour one or some burgers) or (reset one or all customers)
  router.put("/customers/:id?", controller.customer_update_put);
};
