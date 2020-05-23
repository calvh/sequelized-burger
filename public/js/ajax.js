$(function() {
  // * get IDs of selected customers
  function getCustomerIDs() {
    return $("input:checkbox:checked")
      .map(function() {
        return $(this).data("customerid");
      })
      .get();
  }

  // * devour a burger
  $(document).on("click", ".btn-devour-burger", function(event) {
    event.preventDefault();
    const id = $(this).data("burgerid");
    const customers = getCustomerIDs();
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
