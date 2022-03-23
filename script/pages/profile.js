$(document).ready(() => {
  const getUser = async function (id) {
    const docUser = doc(db, "users", id);
    return getDoc(docUser).then((docSnap) => {
      return docSnap;
    });
  };
  const updateUser = async function (user) {
    const docUser = doc(db, "users", user.id);

    delete user.id;
    return updateDoc(docUser, user).then((docSnap) => {
      return responseResult(true, docSnap, "Berhasil mengubah data");
    });
  };

  getUser(getUserInfo().id).then(async (user) => {
    const temp = await user.data();
    $(".skeleton").removeClass("skeleton");
    $(".email-header").text(temp.email);
    $(".profile-username ").text(temp.nama);
    $("input[name='nama']").val(temp.nama);
    $(".email-header").text(temp.email);
    $("input[name='no_hp']").val(temp.no_hp);
    $("textarea[name='alamat']").text(temp.alamat);
    if (temp.fotoprofile) {
      $(".profilepic__image").attr("src", temp.fotoprofile);
    } else {
      $(".profilepic__image").attr("src", "https://via.placeholder.com/150");
    }
    getDoc(temp.jabatan).then((jabatan) => {
      $(".badge").text(jabatan.id.toUpperCase());
    });
  });

  $("#profile-form").submit(function (e) {
    e.preventDefault();
    const data = $(this).serializeArray();
    const user = {
      nama: data[0].value,
      no_hp: data[1].value,
      alamat: data[2].value,
    };
    user.id = getUserInfo().id;

    updateUser(user).then((result) => {
      if (result.status) {
        $.alert({
          title: "Berhasil",
          content: "Biodata Berhasil diubah!",
        });
      }
    });
  });

  $("#profile_image").on("click", function () {
    $("#profile_upload").click();
  });

  $("#profile_upload").on("change", function (e) {
    uploadFile(e.target.files[0], getUserInfo().id).then((url) => {
      const user = {};
      user.id = getUserInfo().id;
      user.fotoprofile = url;
      updateUser(user).then((result) => {
        $.alert({
          title: "Berhasil",
          content: "Foto berhasil diubah!",
        });
      });
    });
    thumbnailFile(this, $(".profilepic__image"));
  });
});
