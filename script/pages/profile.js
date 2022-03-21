$(document).ready(() => {
  $("#profileForm").on("submit", (e) => {
    const data = new FormData($(this));
    const user = {
      nama: data.get("nama"),
      alamat: data.get("alamat"),
      no_hp: data.get("no_hp"),
      email: getUserInfo().email,
      password: getUserInfo().password,
    };

    userRepo.update(user).then((result) => {
      if (result.status) {
        window.location.href = "index.html";
      } else {
        alert(result.message);
      }
    });
  });
});
