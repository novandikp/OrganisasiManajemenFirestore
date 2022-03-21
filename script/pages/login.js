import UserRepository from "../repository/userRepository.js";
$(document).ready(function () {
  const userRepo = new UserRepository();
  $("#login-form").submit(function (e) {
    e.preventDefault();
    const data = new FormData($(this));
    const user = {
      email: data.get("email"),
      password: data.get("password"),
    };
    userRepo.login(user).then(function (result) {
      if (result.status) {
        window.location.href = "index.html";
      } else {
        alert(result.message);
      }
    });
  });
});
