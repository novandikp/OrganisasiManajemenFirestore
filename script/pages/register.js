$(document).ready(() => {
  $("#register-form").submit(function (e) {
    e.preventDefault();

    const data = new FormData($(this));

    if (data.get("password") !== data.get("password-confirm")) {
      const user = {
        email: data.get("email"),
        password: data.get("password"),
        nama: data.get("nama"),
        alamat: data.get("alamat"),
        no_hp: data.get("no_hp"),
      };
      userRepo.register(user).then((result) => {
        if (result.status) {
          window.location.href = "index.html";
        } else {
          alert(result.message);
        }
      });
    } else {
      alert("Password tidak sama");
    }
  });
});
