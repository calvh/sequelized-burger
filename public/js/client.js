$(function() {
  // ------------------------------  GENERAL  -----------------------------

  // * function to get random element from array
  function getRandArr(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // * lists for random name generator
  const names = {
    burgers: {
      list: [
        "50/50 burger",
        "Angus burger",
        "Aussie burger",
        "Bacon cheeseburger",
        "Barbecue burger",
        "Buffalo burger",
        "Butter burger",
        "Bøfsandwich",
        "California burger",
        "Carolina burger",
        "Cheeseburger",
        "Hamdog",
        "Hawaii burger",
        "Krabby patty",
        "Kimchi burger",
        "Pastrami burger",
        "Salmon burger",
        "Steak burger",
        "Teriyaki burger",
        "Veggie burger"
      ]
    },
    customers: {
      list: [
        "Spongebob",
        "Patrick",
        "Squidward",
        "Eugene Krabs",
        "Sandy",
        "Gary",
        "Plankton"
      ]
    }
  };

  // * flash warning messages
  function flashMessage($element) {
    // * make sure element is not visible and not in the middle of fading
    if ($element.css("opacity") == 0) {
      $element
        .fadeTo("slow", 1)
        .delay(1000)
        .fadeTo("slow", 0);
    }
  }

  // * get array of existing burgers/customers
  function getExisting(type) {
    return $(`.${type}-name`)
      .map(function() {
        return $(this).text();
      })
      .get();
  }

  // * initialize tooltips
  $('[data-toggle="tooltip"]').tooltip();

  // ---------------------------  CLICK EVENTS  ---------------------------

  // * scroller
  $(document).on("click", ".btn-start-devouring", function(event) {
    event.preventDefault();
    const position = $(".logo").offset().top;
    $("HTML, BODY").animate({ scrollTop: position }, 1000);
  });

  // * get random customer
  $(document).on("click", "#btn-random-customer", function(event) {
    event.preventDefault();
    const existingCustomers = getExisting("customer");
    const customerChoices = names.customers.list.filter(
      customer => !existingCustomers.includes(customer)
    );

    if (customerChoices.length < 1) {
      flashMessage($("#no-random-customer-names-warning"));
    } else {
      $("[name='customer_name']").val(getRandArr(customerChoices));
    }
  });

  // * get random burger
  $(document).on("click", "#btn-random-burger", function(event) {
    event.preventDefault();
    const existingBurgers = getExisting("burger");
    const burgerChoices = names.burgers.list.filter(
      burger => !existingBurgers.includes(burger)
    );

    if (burgerChoices.length < 1) {
      flashMessage($("#no-random-burger-names-warning"));
    } else {
      $("[name='burger_name']").val(getRandArr(burgerChoices));
    }
  });

  // * remove warning message if customers are checked
  $(document).on("click", "[type='checkbox']", function(event) {
    const elements = $(".no-customers-warning");
    if (elements.css("opacity") == 1) {
      elements.fadeTo("slow", 0);
    }
  });

  // * trigger form submit (necessary because button is not within form div)
  $(document).on("click", "#btn-new-burger", function(event) {
    $("#add-burger").submit();
  });

  // * trigger form submit (necessary because button is not within form div)
  $(document).on("click", "#btn-new-customer", function(event) {
    $("#add-customer").submit();
  });

  // -------------------------------  AJAX  -------------------------------

  // * devour a burger
  $(document).on("click", ".btn-devour-burger", function(event) {
    event.preventDefault();
    const id = $(this).data("burgerid");

    // * get IDs of selected customers
    const customers = $("input:checkbox:checked")
      .map(function() {
        return $(this).data("customerid");
      })
      .get();

    if (customers.length > 0) {
      $.ajax(`/burgers/${id}`, {
        type: "PUT",
        data: { customers: customers }
      })
        .done(function(data) {
          console.log("Successfully devoured burger.");
          location.reload();
        })
        .fail(function(data) {
          console.log("Devour burger failed.");
        });
    } else {
      const warning = $(this)
        .closest("ul")
        .siblings(".no-customers-warning");
      flashMessage(warning);
      console.log("No customers selected!");
    }
  });

  // * reset this burger to "fresh"
  $(document).on("click", ".btn-reset-burger", function(event) {
    event.preventDefault();
    const id = $(this).data("burgerid");

    $.ajax(`/burgers/${id}`, {
      type: "PUT",
      data: { reset: true }
    })
      .done(function(data) {
        console.log("Successfully reset burger.");
        location.reload();
      })
      .fail(function(data) {
        console.log("Reset burger failed.");
      });
  });

  // * reset all burgers to "fresh"
  $(document).on("click", "#btn-reset-all-burgers", function(event) {
    event.preventDefault();
    if ($(".devoured-burger").length) {
      $.ajax("/burgers/", {
        type: "PUT"
      })
        .done(function(data) {
          console.log("Successfully reset all burgers.");
          location.reload();
        })
        .fail(function(data) {
          console.log("Reset all burgers failed.");
        });
    } else {
      console.log("No burgers to reset!");
    }
  });

  // * submit request to make a new burger
  $(document).on("submit", "#add-burger", function(event) {
    event.preventDefault();
    const burgerName = $("#add-burger [name=burger_name]")
      .val()
      .trim();

    if (burgerName) {
      $.ajax("/burgers", {
        type: "POST",
        data: {
          burger_name: burgerName
        }
      })
        .done(function(data) {
          console.log("Successfully added new burger.");
          location.reload();
        })
        .fail(function(data) {
          console.log("Add new burger failed.");
        });
    } else {
      console.log("Burger name cannot be empty!");
    }
  });

  // * submit request to make a new customer
  $(document).on("submit", "#add-customer", function(event) {
    event.preventDefault();
    const customerName = $("#add-customer [name=customer_name]")
      .val()
      .trim();

    if (customerName) {
      $.ajax("/customers", {
        type: "POST",
        data: {
          customer_name: customerName
        }
      })
        .done(function(data) {
          console.log("Successfully added new customer.");
          location.reload();
        })
        .fail(function(data) {
          console.log("Add new customer failed.");
        });
    } else {
      console.log("Customer name cannot be empty!");
    }
  });
});
