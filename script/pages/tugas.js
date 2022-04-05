$(document).ready(function() {
    let fileImage;
    const showItem = 5;
    let lastItem;

    $("input[name='berkas']").on("change", function(e) {
        fileImage = e.target.files[0];
    });

    const deleteBerkas = async function(id) {
        const docUser = doc(db, "berkas", id);
        const docSnap = await deleteDoc(docUser);
        return docSnap;
    };

    $("#formBerkas").submit(function(e) {
        e.preventDefault();
        const berkas = {};
        const btn = $("button[type='submit']");
        btn.attr("disabled", true);
        berkas.nama_berkas = $("input[name='nama_berkas']").val();
        berkas.created_at = new Date().toISOString();
        berkas.updated_at = new Date().toISOString();
        berkas.id = uuid("berkas_");
        berkas.deskripsi = $("textarea[name='deskripsi_berkas']").val();
        berkas.author = doc(db, "users", getUserInfo().id);

        uploadFile(fileImage, berkas.id).then((url) => {
            berkas.dokumen = url;
            const berkasBaru = doc(db, "berkas", berkas.id);
            setDoc(berkasBaru, berkas).then((doc) => {
                $("#formBerkas").trigger("reset");
                btn.removeAttr("disabled");
                $.alert({
                    title: "Berhasil",
                    content: "Berhasil menambahkan berkas",
                });
                lastItem = null;
                getBerkas();
            });
        });
    });

    const itemLoad = () => {
        if (!lastItem) {
            $(".list-data").empty();
        }
        for (let i = 0; i < showItem; i++) {
            const item = `<div class="card shadow skeleton item-list">
      <div class="card-body skeleton">
      <div class="row">
        
        <div class="col-md-9 col-sm-9 item-info">
          <h5 class="skeleton">a</h5>
          <small class="text-muted skeleton">a</small><br/>
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
        $(".list-data").on("click", ".btn-load-more", async function() {
            getBerkas($("#search").val());
        });
        $(".list-data").on("click", ".item-hapus", async function() {
            const id = $(this).data("id");
            const element = $(this);
            $.confirm({
                title: "Konfirmasi",
                content: "Apakah anda yakin untuk menghapus data ini?",
                buttons: {
                    confirm: function() {
                        element.attr("disabled", true);
                        deleteBerkas(id).then(() => {
                            lastItem = null;
                            getBerkas();
                        });
                    },
                    cancel: function() {},
                },
            });
        });
    }

    const getBerkas = (search = "") => {
        $(".btn-load-more").remove();
        fetchDataBerkas(search).then(async(querySnapshot) => {
            $(".card.shadow.skeleton.item-list").remove();

            if (querySnapshot.length == 0) {
                $(".list-data").append(elementNotFound);
            } else {
                let index = showItem + 1;
                querySnapshot.forEach(async(element) => {
                    index--;
                    if (index > 0) {
                        let item = `<div class="card shadow item-list">
                            <div class="card-body">
                            <div class="row">
                            
                            <div class="col-md-9 col-sm-9 item-info">
                                <h5>${element.nama_berkas}</h5>
                                <small class="text-muted">${
                                  element.deskripsi
                                    ? element.deskripsi
                                    : "(Tanpa Deskripsi)"
                                }</small><br/>
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
                    } else {
                        let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
                        $(".list-data").append(loadMore);
                    }
                });
            }
        });
    };

    const fetchDataBerkas = async(search = $("#search").val()) => {
        let q;
        const promise = [];
        if (lastItem) {
            q = query(
                collection(db, "berkas"),
                orderBy("nama_berkas", "asc"),
                startAt(lastItem),
                where("nama_berkas", ">=", search),
                where("nama_berkas", "<=", search + "~"),
                limit(showItem + 1)
            );
        } else {
            $(".list-data").empty();
            q = query(
                collection(db, "berkas"),
                orderBy("nama_berkas", "asc"),
                where("nama_berkas", ">=", search),
                where("nama_berkas", "<=", search + "~"),
                limit(showItem + 1)
            );
            itemLoad();
        }

        await getDocs(q).then(async(querySnapshot) => {
            lastItem = querySnapshot.docs[querySnapshot.docs.length - 1];
            querySnapshot.forEach((doc) => {
                const element = doc.data();
                element.id = doc.id;
                promise.push(element);
            });
        });
        return promise;
    };

    itemEvent();

    $("#formSearch").on("submit", (e) => {
        e.preventDefault();
        if ($("#search").val() != "") {
            lastItem = null;
            getBerkas($("#search").val());
        }
    });

    $("#search").on("search", function(evt) {
        if ($(this).val().length == 0) {
            lastItem = null;
            getBerkas();
        }
    });
    getBerkas();
});