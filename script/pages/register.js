$(document).ready(() => {
  $("#register-form").submit(function (e) {
    e.preventDefault();
    const data = new FormData($(this));
    const user = {
      email: data.get("email"),
      password: data.get("password"),
    };
    userRepo.login(user).then((result) => {
      if (result.status) {
        window.location.href = "index.html";
      } else {
        alert(result.message);
      }
    });
  });
});
