let loginUser = localStorage.getItem("loginUsername");

function admin() {
  let loginID = localStorage.getItem("loginDetail");

  if (loginID) {
    $.get("http://localhost:3000/users", function(data) {
      for (i = 0; i < data.length; i++) {
        if (loginID == data[i]["id"]) {
          if (data[i].hasOwnProperty("admin")) {
          } else {
            $(".admin").hide();
          }
        }
      }
    });
  }
}

$(document).ready(function() {
  //Hiding admin processes like Creat, Delete and Update questions
  admin();
  $("body")
    .find(".admin")
    .on("load", admin());

  $("#logout").before(
    `<button class="btn btn-light" type="button" disabled>${loginUser}</button>`
  );

  //Searching questions
  $("#search").submit(function(event) {
    event.preventDefault();
    if ($("#searchstring").val() !== "") {
      let searchstring = $("#searchstring").val();

      localStorage.setItem("searchstring", searchstring);

      window.open("searchresult.html", "_self", false);
    }
  });

  //Displaying search results
  $.get(
    `http://localhost:3000/questions?q=${localStorage.getItem("searchstring")}`,
    function(data) {
      for (i = 0; i < data.length; i++) {
        const question = data[i]["question"];
        const answer = data[i]["answer"];
        $("#searchli").append(`<li>${question}</li>`);
      }

      localStorage.removeItem("searchstring");
    }
  );

  // Adding Questions and correct answer from user
  $("#addquestion").submit(function(event) {
    event.preventDefault();
    if ($(".question").val() !== "" && $(".answer").val() !== "") {
      const question = $(".question").val();
      const answer = $(".answer").val();
      let newQuestions = {
        question,
        answer
      };
      $.ajax({
        method: "POST",
        url: "http://localhost:3000/questions",
        data: newQuestions
      })
        .done(function(newQuestions) {
          alert("Question Saved: " + newQuestions);
          const postData = JSON.stringify(newQuestions);
          localStorage.setItem("post", postData);
        })
        .fail(function(err) {
          alert("Error" + msg);
        });
    }
  });

  // Getting questions from database
  $.get("http://localhost:3000/questions", function(data) {
    for (let i = 0; i < data.length; i++) {
      let question = data[i]["question"];
      let id = data[i]["id"];
      $("#quest-li").append(
        `<li id="disp${id}"> ${question} <a role="button" style="margin: 0 15px 0 50px"class="btn-outline-primary update admin" id="${id}" href="">Update</a> <a role="button" class="btn-outline-danger remove admin" id="${id}" href="">Delete</a></li>`
      );
    }
  });

  // Getting the options and answers
  var options = [
    "Host",
    "Data",
    "Three",
    "HTML",
    "Six",
    "Mark Up",
    "Language",
    "Body Tag",
    "None of the above",
    "All of the above",
    "Zero",
    "I do not know",
    "One",
    "Two"
  ];

  $.get("http://localhost:3000/questions", function(data) {
    for (let j = 0; j < data.length; j++) {
      var question = data[j].question;
      var answer = data[j]["answer"];
      var id = data[j]["id"];

      let rand1 = Math.random();
      let randIndex1 = Math.floor(rand1 * options.length);
      let randomOption1 = options[randIndex1];

      let rand2 = Math.random();
      let randIndex2 = Math.floor(rand2 * options.length);
      let randomOption2 = options[randIndex2];

      // Adding a div to add questions
      $("#quizli").append(`<div id="quiz` + id + `"></div>`);

      // Adding a question
      $("#quiz" + id).append(
        `<li class="quizquest" id="quest>` + id + `">` + question + `</li>`
      );

      // Adding radio option (answer)
      $("#quiz" + id).append(
        `<input type="radio" class="form-check-input" name="group` +
          id +
          `" value="` +
          answer +
          `" id="num` +
          id +
          `"/><label for="num` +
          id +
          `">` +
          answer +
          `
        </label>`
      );

      $("#quiz" + id).append("<br>");

      // Adding radio option 1
      $("#quiz" + id).append(
        `<input type="radio" class="form-check-input" name="group` +
          id +
          `" value="` +
          randomOption1 +
          `" id="num` +
          id +
          `"/><label for="num` +
          id +
          `">` +
          randomOption1 +
          `
        </label>`
      );

      $("#quiz" + id).append("<br>");

      // Adding radio option 2
      $("#quiz" + id).append(
        `<input type="radio" class="form-check-input" name="group` +
          id +
          `" value="` +
          randomOption2 +
          `" id="num` +
          id +
          `"/><label for="num` +
          id +
          `">` +
          randomOption2 +
          `
        </label>`
      );
      $("#quiz" + id).append("<hr>");
    }
  });

  // Quiz result calculations and display
  $("#target").submit(function(event) {
    event.preventDefault();

    $("#target").hide();
    let count = 0;
    let numQuest = 0;
    $.get("http://localhost:3000/questions", function(data) {
      numQuest = data.length;
      for (let k = 0; k < data.length; k++) {
        var answer = data[k]["answer"];
        var id = data[k]["id"];
        var radioValue = document.querySelector(
          `input[name="group${id}"]:checked`
        ).value;
        if (radioValue == answer) {
          count += 1;
        }
      }

      let percentPassed = Math.floor((count / numQuest) * 100);

      $.get("http://localhost:3000/users", function(data) {
        for (i = 0; i < data.length; i++) {
          let loginid = localStorage.getItem("loginDetail");
          let userID = data[i]["id"];
          let scores = JSON.parse(data[i]["scores"]);

          if (loginid == userID) {
            scores.push(percentPassed);
            scores = JSON.stringify(scores);

            let allScores = { scores };

            $.ajax({
              method: "PATCH",
              url: `http://localhost:3000/users/${userID}`,
              data: allScores
            })
              .done(function() {
                $("#main").append(
                  `<div class="jumbotron mx-auto d-block" id="resultdisplay"></div>`
                );
                $("#resultdisplay").append(
                  `<p id="quizResult"> Congratulations!! You scored ${percentPassed}%!`
                );
                $("#resultdisplay").append(
                  `<a role="button" class="btn btn-primary" href="" style="margin: 10px">Retake Quiz</a>`
                );
                $("#resultdisplay").append(
                  `<a role="button" class="btn btn-danger" href="" style="margin: 10px">Close</a>`
                );
              })
              .fail(function() {
                alert("Error: Please retake quiz");
              });
          }
        }
      });
    });
    return false;
  });

  // Delete buttons on questions
  $("#quest-li").delegate(".remove", "click", function() {
    if (confirm("Are you sure you want to delete this question?")) {
      $.ajax({
        method: "DELETE",
        url: `http://localhost:3000/questions/${$(this).attr("id")}`
      });
    } else {
      window.location.href = "index1.html";
    }
  });

  // Adding User's data from SignUp
  $("#signup").submit(function(event) {
    event.preventDefault();
    if (
      $(".form-control").val() !== "" &&
      $("#tandC").is(":checked") &&
      $("#inputPassword").val() == $("#retypePassword").val()
    ) {
      const firstname = $("#firstName").val();
      const lastname = $("#lastName").val();
      const username = $("#userName").val();
      const email = $("#inputEmail").val();
      const password = $("#retypePassword").val();
      const scores = "[]";

      let newUser = {
        firstname,
        lastname,
        username,
        email,
        password,
        scores
      };

      $.ajax({
        method: "POST",
        url: "http://localhost:3000/users",
        data: newUser
      })
        .done(function(newUser) {
          window.location.href = "signin.html";
          alert("Details Saved");
          const postData = JSON.stringify(newUser);
          localStorage.setItem("post", postData);
        })
        .fail(function(err) {
          alert("Error" + msg);
        });
    } else if ($("#inputPassword").val() !== $("#retypePassword").val()) {
      alert("Password does not match");
    } else {
      alert("Agree to the terms and condition to continue");
    }
  });

  // Sign In
  $("#signin").submit(function(event) {
    event.preventDefault();
    if ($(".form-control").val()) {
      let signInEmail = $("#signinEmail").val();
      let signInPassword = $("#signinPassword").val();
      let notUser = `<p color="red">* Incorrect Username/Password</p>`;
      $.get("http://localhost:3000/users", function(data) {
        for (i = 0; i < data.length; i++) {
          let email = data[i]["email"];
          let password = data[i]["password"];
          let id = data[i]["id"];
          let username = data[i]["username"];

          if (signInEmail == email && signInPassword == password) {
            localStorage.setItem("loginDetail", JSON.stringify(id));
            localStorage.setItem("loginUsername", username);
            window.location.href = "landingpage.html";
          }
        }
        $("h3").after(notUser);
      });
    } else {
      $("h3").after(`<p color="red">* Enter Username/Password</p>`);
    }
  });

  // Updating questions
  $("#quest-li").delegate(".update", "click", function() {
    event.preventDefault();
    let id = $(this).attr("id");
    let question;
    let answer;
    $.get("http://localhost:3000/questions", function(data) {
      for (i = 0; i < data.length; i++) {
        if (id == data[i]["id"]) {
          question = data[i]["question"];
          answer = data[i]["answer"];
        }
      }
      $(`#disp${id}`).html(`
        <div id="updateField">
          <form id="${id}">
            <label for="updateQuest" class="text-dark">
              Question
            </label>
            <input
              type="text"
              class="question"
              id="updateQuest"
              aria-describedby="emailHelp"
              placeholder="${question}"
              value="${question}"
            />
            ;
            <label for="updateAnswer" class="text-dark">
              Answer
            </label>
            <input
              type="text"
              class="answer"
              id="updateAnswer"
              placeholder="${answer}"
              value="${answer}"
            />
            <button type="submit" class="btn btn-primary" value="Go">
              Update
            </button>
          </form>
          <button
            type="submit"
            id="cancelUpdate"
            class="btn btn-primary"
            value="Go"
          >
            Cancel
          </button>
        </div>
      `);
    });
  });

  // Cancelling Question Update
  $("#quest-li").delegate("#cancelUpdate", "click", function() {
    window.location.href = "index1.html";
  });

  // Updating a question
  $("#quest-li").delegate("form", "submit", function() {
    event.preventDefault();
    if ($("#updateQuest").val() !== "" && $("#updateAnswer").val() !== "") {
      let question = $("#updateQuest").val();
      let answer = $("#updateAnswer").val();

      let updatedQuest = { question, answer };

      $.ajax({
        method: "PUT",
        url: `http://localhost:3000/questions/${$(this).attr("id")}`,
        data: updatedQuest
      })
        .done(function(updatedQuest) {
          window.location.href = "index1.html";
          alert("Question Updated: " + updatedQuest[question]);
          const postData = JSON.stringify(updatedQuest);
          localStorage.setItem("post", postData);
        })
        .fail(function(err) {
          alert("Error" + msg);
        });
    }
  });

  //Displaying All Candidates' scores
  $.get("http://localhost:3000/users", function(data) {
    for (i = 0; i < data.length; i++) {
      const username = data[i]["username"];
      const scores = JSON.parse(data[i]["scores"]);

      $("#scoreli").append(
        `<li><strong>${username}</strong>: ${[...scores]} </li>`
      );
    }
  });

  $("#logout").click(function(event) {
    event.preventDefault();
    localStorage.removeItem("loginDetail");
    window.location.href = "signin.html";
  });

  $("#addtoggle").click(function(event) {
    event.preventDefault();
    $("#addquestion").toggle();
  });
});

function goBack() {
  window.history.back();
}
