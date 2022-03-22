$(document).ready(function () {
  const getUser = (search = "") => {
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

        const item = `<div class="card shadow item-list">
            <div class="card-body">
            <div class="row">
              
              <div class="col-md-9 col-sm-9 item-info">
                <h5>${element.nama}</h5>
                <p class="text-muted">${element.email}</p>
                <p class="text-muted">088888</p>
                <p class="text-muted">${element.jabatan}</p>
              </div>
              <div class="col-md-3 col-sm-3">
                  <div class="float-sm-right d-grid gap-2 d-md-block mt-3">
                    <button class="btn btn-secondary btn-sm ml-2"><i class="fa fa-info me-2"></i>Detail</button>
                    <button class="btn btn-primary btn-sm ml-2"><i class="fa fa-pencil me-2"></i>Edit</button>
                    <button class="btn btn-danger btn-sm ml-2"><i class="fa fa-trash me-2"></i>Hapus</button>
                  </div>
              </div>
            </div>
        </div>
          </div>`;

        $(".list-data").append(item);
      });
    });
  };

  getUser();
});
