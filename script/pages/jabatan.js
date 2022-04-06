$(document).ready(function() {
    let lastItem;
    const itemShow = 5;

    const itemLoad = () => {
        if (!lastItem) {
            $(".list-data").empty();
        }
        for (let i = 0; i < itemShow; i++) {
            const item = `<div class="card shadow skeleton item-list">
          <div class="card-body skeleton">
          <div class="row">
            
            <div class="col-md-9 col-sm-9 item-info">
              <h5 class="skeleton">a</h5>
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

    const getDataJabatan = () => {
        itemLoad();
        const q = query(
            collection(db, "jabatan"),
            where("jabatan", ">=", lastItem ? lastItem.jabatan : ""),
            orderBy("jabatan"),
            limit(itemShow + 1)
        );
        getDocs(q).then((docSnap) => {
            if (!lastItem) {
                $(".list-data").empty();
            } else {
                $(".btn-load-more").remove();
            }
            $(".card.shadow.skeleton.item-list").remove();

            let index = itemShow + 1;
            docSnap.forEach(async(docSnapshot) => {
                const dataTemp = docSnapshot.data();
                dataTemp.id = docSnapshot.id;
                index--;

                if (index > 0) {
                    let item = `<div class="card shadow item-list">
            <div class="card-body">
            <div class="row">
              
              <div class="col-md-9 col-sm-9 item-info">
                <h5>${dataTemp.jabatan}</h5>
                <small class="text-muted">${dataTemp.keterangan}</small>
              </div>
              <div class="col-md-3 col-sm-3">
                  <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
                    <button data-id='${dataTemp.id}' class="btn btn-secondary btn-sm ml-2 item-edit"><i class="fa fa-pencil me-2"></i>Edit</button>
                    <button data-id='${dataTemp.id}' class="btn btn-danger btn-sm ml-2 item-hapus"><i class="fa fa-trash me-2"></i>Hapus</button>
                  </div>
              </div>
            </div>
        </div>
        </div>`;
                    $(".list-data").append(item);
                } else {
                    lastItem = dataTemp;
                    let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
                    $(".list-data").append(loadMore);
                }
            });
        });
    };

    const addJabatan = async() => {
        const jabatan = $("#jabatan").val();
        const keterangan = $("#keterangan").val();
        const jabatanBaru = doc(db, "jabatan", uuid("jabatan_"));
        const newJabatan = {
            ... { jabatan: jabatan, keterangan: keterangan },
            ...getAksesValue(),
        };
        setDoc(jabatanBaru, newJabatan);
        return responseResult(true, newJabatan, "Berhasil menambah jabatan");
    };

    const selectJabatantoForm = async(id) => {
        getDoc(doc(db, "jabatan", id)).then((jabatan) => {
            const temp = jabatan.data();
            $("#jabatan").val(temp.jabatan);
            $("#keterangan").val(temp.keterangan);
            $("#id").val(jabatan.id);
            $("#modal-akses").modal("show");
            let selectAll = true;
            $(".detail-check input[type='checkbox']").each(function() {
                if (temp[$(this).attr("id")] == true) {
                    $(this).prop("checked", true);
                } else {
                    selectAll = false;
                    $(this).prop("checked", false);
                }
            });

            if (selectAll) {
                $("#selectAll").prop("checked", true);
            }
        });
    };

    const editJabatan = async() => {
        const id = $("#id").val();
        const jabatan = $("#jabatan").val();
        const keterangan = $("#keterangan").val();
        const jabatanBaru = doc(db, "jabatan", id);
        const newJabatan = {
            ... { jabatan: jabatan, keterangan: keterangan },
            ...getAksesValue(),
        };
        setDoc(jabatanBaru, newJabatan);
        if (id == getUserInfo().jabatan) {
            localStorage.removeItem("recent_update_info");
            updateLoginInfo();
        }
        return responseResult(true, newJabatan, "Berhasil mengubah jabatan");
    };

    const deleteJabatan = async(id) => {
        if (id == "anggota") {
            return responseResult(false, null, "Jabatan tidak dapat dihapus");
        }
        const jabatanBaru = doc(db, "jabatan", id);
        const q = query(
            collection(db, "users"),
            where("jabatan", "==", jabatanBaru),
            limit(1)
        );

        return getDocs(q).then((snapshot) => {
            if (snapshot.empty) {
                deleteDoc(jabatanBaru);
                return responseResult(true, null, "Berhasil menghapus jabatan");
            } else {
                return responseResult(false, null, "Jabatan tidak dapat dihapus");
            }
        });
    };

    const getAksesValue = () => {
        const values = {};
        const akses = [
            "akses_anggota",
            "akses_blog",
            "akses_jabatan",
            "akses_arsip",
            "akses_kas",
            "akses_keuangan",
            "akses_pengaturan",
        ];

        const checkboxValues = [];
        $('input[name="akses"]:checked').map(function() {
            checkboxValues.push($(this).val());
            values[$(this).val()] = true;
        });

        const unselectedValue = akses.filter(
            (item) => !checkboxValues.includes(item)
        );

        unselectedValue.forEach((item) => {
            values[item] = false;
        });
        return values;
    };

    const checkBoxEvent = () => {
        $("#selectAll").change(function() {
            if ($(this).is(":checked")) {
                $(".hak-akses input[type='checkbox']").prop("checked", true);
            } else {
                $(".hak-akses input[type='checkbox']:checked").prop("checked", false);
            }
        });
        $(".detail-check input[type='checkbox']").change(function() {
            if (
                $(this).is(":checked") &&
                $(".detail-check input[type='checkbox']:checked").length ==
                $(".detail-check input[type='checkbox']").length
            ) {
                $("#selectAll").prop("checked", true);
            } else {
                $("#selectAll").prop("checked", false);
            }
        });
    };

    const itemEvent = () => {
        $(".list-data").on("click", ".btn-load-more", async function() {
            getDataJabatan($("#search").val());
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
                        deleteJabatan(id).then((result) => {
                            if (!result.status) {
                                $.alert({
                                    title: "Gagal",
                                    content: result.message,
                                });
                            }
                            lastItem = null;
                            getDataJabatan();

                            element.attr("disabled", false);
                        });
                    },
                    cancel: function() {},
                },
            });
        });
        $(".list-data").on("click", ".item-edit", async function() {
            selectJabatantoForm($(this).data("id"));
        });
    };

    $("#jabatan-form").on("submit", function(e) {
        e.preventDefault();
        if ($("#id").val() == "") {
            addJabatan().then((result) => {
                $(".form-jabatan").trigger("reset");
                $("#modal-akses").modal("hide");
                if (result.status) {
                    $("#jabatan").val("");
                    $("#keterangan").val("");
                    $("#selectAll").prop("checked", false);
                    lastItem = null;
                    getDataJabatan();
                } else {
                    $.alert({
                        title: "Gagal",
                        content: result.message,
                    });
                }
            });
        } else {
            editJabatan().then((result) => {
                $(".form-jabatan").trigger("reset");
                $("#modal-akses").modal("hide");
                if (result.status) {
                    $("#jabatan").val("");
                    $("#keterangan").val("");
                    $("#selectAll").prop("checked", false);
                    lastItem = null;
                    getDataJabatan();
                } else {
                    $.alert({
                        title: "Gagal",
                        content: result.message,
                    });
                }
            });
        }
    });
    itemEvent();
    checkBoxEvent();
    getDataJabatan();
});