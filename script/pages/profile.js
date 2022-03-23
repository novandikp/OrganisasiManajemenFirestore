$(document).ready(() => {
  const getUser = async function (id) {
    const docUser = doc(db, "users", id);
    return getDoc(docUser).then((docSnap) => {
      return docSnap;
    });
  };
  getUser(getUserInfo().id).then(async (user) => {
    const temp = await user.data();
    $(".email-header").text(temp.email);
    $(".profile-username ").text(temp.nama);
    $("input[name='nama']").val(temp.nama);
    $(".email-header").text(temp.email);
    $("input[name='no_hp']").val(temp.no_hp);
    $("textarea[name='alamat']").text(temp.alamat);
    getDoc(temp.jabatan).then((jabatan) => {
      $(".badge").text(jabatan.id);
    });
  });
});
