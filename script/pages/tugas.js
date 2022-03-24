$(document).ready(function () {
  let fileImage;
  $("input[name='berkas']").on("change", function (e) {
    fileImage = e.target.files[0];
  });

  const deleteBerkas = async function (id) {
    const docUser = doc(db, "berkas", id);
    const docSnap = await deleteDoc(docUser);
    return docSnap;
  };

  $("#formBerkas").submit(function (e) {
    e.preventDefault();
    const berkas = {};
    const btn = $("button[type='submit']");
    btn.attr("disabled", true);
    console.log("loading");
    berkas.nama_berkas = $("input[name='nama_berkas']").val();
    berkas.created_at = new Date().toISOString();
    berkas.updated_at = new Date().toISOString();
    berkas.id = uuid("berkas_");
    berkas.deskripsi = $("textarea[name='deskripsi_berkas']").text();
    berkas.author = doc(db, "users", getUserInfo().id);
    uploadFile(fileImage, berkas.id).then((url) => {
      berkas.dokumen = url;
      const berkasBaru = doc(db, "berkas", berkas.id);
      setDoc(berkasBaru, berkas).then((doc) => {
        $("#formBerkas").trigger("reset");
        btn.removeAttr("disabled");
      });
    });
  });

  const itemLoad = () => {
    $(".list-data").empty();
    for (let i = 0; i < 4; i++) {
      const item = `<div class="card shadow skeleton item-list">
      <div class="card-body skeleton">
      <div class="row">
        
        <div class="col-md-9 col-sm-9 item-info">
          <h5 class="skeleton">a</h5>
          <small class="text-muted skeleton">a</small>
          <small class="text-muted skeleton">a</small>
        </div>
        <div class="col-md-3 col-sm-3">
            <div class="float-sm-right skeleton d-grid gap-2 d-xl-block mt-3">
                </div>
        </div>
      </div>
  </div>
  </div>`;

      $(".list-data").append(item);
    }
  };

  function itemEvent() {
    $(".list-data").on("click", ".item-hapus", async function () {
      const id = $(this).data("id");
      const element = $(this);
      $.confirm({
        title: "Konfirmasi",
        content: "Apakah anda yakin untuk menghapus data ini?",
        buttons: {
          confirm: function () {
            element.attr("disabled", true);
            deleteBerkas(id).then(() => {
              getBerkas();
            });
          },
          cancel: function () {},
        },
      });
    });
  }

  const getBerkas = (search = "") => {
    itemLoad();
    const q = query(
      collection(db, "berkas"),
      where("nama_berkas", ">=", search),
      where("nama_berkas", "<=", search + "~")
    );

    getDocs(q).then(async (querySnapshot) => {
      $(".list-data").empty();
      querySnapshot.forEach(async (doc) => {
        const element = doc.data();
        element.id = doc.id;

        let item = `<div class="card shadow item-list">
            <div class="card-body">
            <div class="row">
              
              <div class="col-md-9 col-sm-9 item-info">
                <h5>${element.nama_berkas}</h5>
                <small class="text-muted">${element.deskripsi}</small>
                <small class="text-muted">${format_date(
                  element.created_at
                )}</small>
              </div>
              <div class="col-md-3 col-sm-3">
                  <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
                    <a target="_blank" href="${
                      element.dokumen
                    }" class="btn btn-secondary btn-sm ml-2 item-detail"><i class="fa fa-download me-2"></i>Download</a>
                    <button data-id='${
                      element.id
                    }' class="btn btn-danger btn-sm ml-2 item-hapus"><i class="fa fa-trash me-2"></i>Hapus</button>
                  </div>
              </div>
            </div>
        </div>
        </div>`;

        $(".list-data").append(item);
      });
    });
  };
  itemEvent();
  getBerkas();
});
