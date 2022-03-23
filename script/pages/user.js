$(document).ready(function () {
  const getUser = async function (id) {
    const docUser = doc(db, "users", id);
    const docSnap = await getDoc(docUser);
    return docSnap;
  };
  const deleteUser = async function (id) {
    const docUser = doc(db, "users", id);
    const docSnap = await deleteDoc(docUser);
    return docSnap;
  };

  const updateUser = async function (user) {
    const docUser = doc(db, "users", user.id);
    delete user.id;
    const docSnap = await setDoc(docUser, user);
    return responseResult(true, docSnap, "Berhasil mengubah data");
  };

  const itemLoad = () => {
    $(".list-data").empty();
    for (let i = 0; i < 3; i++) {
      const item = `<div class="card shadow skeleton item-list">
      <div class="card-body ">
      <div class="row">
        
        <div class="col-md-9 col-sm-9 item-info">
          <h5 class="">Nama Anggota</h5>
          <p class="">No Hp</p>
          <p class="">ads</p>
          <p class="">asds</p>
        </div>
        <div class="col-md-3 col-sm-3">
            <div class="float-sm-right d-grid gap-2 d-md-block mt-3">
              
            </div>
        </div>
      </div>
  </div>
    </div>`;

      $(".list-data").append(item);
    }
  };

  const itemEvent = () => {
    $(".list-data").on("click", ".item-detail", function () {
      const data = $(this).data("detail");
      $("#nama").val(data.nama);
      $("#email").val(data.email);
      $("#alamat").val(data.alamat);
      $("#no_hp").val(data.no_hp);
      $("#jabatan").val(data.jabatan);
      $("#detailModal").modal("show");
    });

    $(".list-data").on("click", ".item-setuju", function () {
      const id = $(this).data("id");
      $(this).attr("disabled", true);
      getUser(id).then(async (user) => {
        const temp = await user.data();
        temp.status = true;
        temp.id = id;
        await updateUser(temp);
        getUsers();
      });
    });
    $(".list-data").on("click", ".item-hapus", async function () {
      const id = $(this).data("id");
      $(this).attr("disabled", true);
      await deleteUser(id);
      getUsers();
    });
  };
  const getUsers = (search = "") => {
    itemLoad();
    const q = query(
      collection(db, "users"),
      where("nama", ">=", search),
      where("nama", "<=", search + "~")
    );

    getDocs(q).then(async (querySnapshot) => {
      $(".list-data").empty();
      querySnapshot.forEach(async (doc) => {
        const element = doc.data();
        const jabatan = await getDoc(element.jabatan);
        element.jabatan = jabatan.id;
        element.id = doc.id;

        let item = `<div class="card shadow item-list">
            <div class="card-body">
            <div class="row">
              
              <div class="col-md-9 col-sm-9 item-info">
                <h5>${element.nama}</h5>
                <p class="text-muted">${element.email}</p>
                <p class="text-muted">${element.no_hp}</p>
                <p class="text-muted">${element.alamat}</p>
              </div>
              <div class="col-md-3 col-sm-3">
                  <div class="float-sm-right d-grid gap-2 d-md-block mt-3">
                    <button data-detail='${JSON.stringify(
                      element
                    )}' class="btn btn-secondary btn-sm ml-2 item-detail"><i class="fa fa-info me-2"></i>Detail</button>
                    <button class="btn btn-primary btn-sm ml-2"><i class="fa fa-pencil me-2"></i>Edit</button>
                    <button data-id='${
                      element.id
                    }' class="btn btn-danger btn-sm ml-2 item-hapus"><i class="fa fa-trash me-2"></i>Hapus</button>
                  </div>
              </div>
            </div>
        </div>
          </div>`;

        if (!element.status) {
          item = `<div class="card shadow item-list">
            <div class="card-body">
            <div class="row">
              
              <div class="col-md-9 col-sm-9 item-info">
                <h5>${element.nama}</h5>
                <p class="text-muted">${element.email}</p>
                <p class="text-muted">${element.no_hp}</p>
                <p class="text-muted">${element.alamat}</p>
              </div>
              <div class="col-md-3 col-sm-3">
                  <div class="float-sm-right d-grid gap-2 d-md-block mt-3">
                    <button data-detail='${JSON.stringify(
                      element
                    )}' class="btn btn-secondary btn-sm ml-2 item-detail"><i class="fa fa-info me-2"></i>Detail</button>
                    <button data-id='${
                      element.id
                    }' class="btn btn-success btn-sm ml-2 item-setuju"><i class="fa fa-check me-2"></i>Setujui</button>
                    <button  data-id='${
                      element.id
                    }' class="btn btn-danger btn-sm ml-2 item-hapus"><i class="fa fa-trash me-2"></i>Hapus</button>
                  </div>
              </div>
            </div>
        </div>
          </div>`;
        }
        $(".list-data").append(item);
      });
    });
  };

  $("#formSearch").on("submit", (e) => {
    e.preventDefault();

    getUsers($("#search").val());
  });

  $("#search").on("search", function (evt) {
    if ($(this).val().length == 0) {
      getUsers();
    }
  });
  itemEvent();
  getUsers();
});
