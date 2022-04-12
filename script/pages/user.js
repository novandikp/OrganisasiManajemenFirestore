import AnggotaRepository from "../repository/anggotaRepository.js?v=1.3";
$(document).ready(function() {
            let lastItem;
            const itemShow = 5;
            const anggotaRepo = new AnggotaRepository();
            const dokumen = new jsPDF();
            const deleteUser = async function(id) {
                const docUser = doc(db, "users", id);
                const docSnap = await deleteDoc(docUser);
                anggotaRepo.kurangAnggota();
                return docSnap;
            };

            const updateUser = async function(user) {
                const docUser = doc(db, "users", user.id);
                if (user.id == getUserInfo().id) {
                    localStorage.removeItem("recent_update_info");
                    updateLoginInfo();
                }
                delete user.id;
                return updateDoc(docUser, user).then((docSnap) => {
                    return responseResult(true, docSnap, "Berhasil mengubah data");
                });
            };

            const fetchJabatan = async function() {
                const q = collection(db, "jabatan");
                return getDocs(q).then(function(docSnap) {
                    $("#jabatan").empty();
                    docSnap.forEach((doc) => {
                        const data = doc.data();
                        data.id = doc.id;
                        $("#jabatan").append(
                            `<option value="${data.id}">${data.jabatan}</option>`
                        );
                    });
                });
            };

            const itemLoad = () => {
                for (let i = 0; i < itemShow; i++) {
                    const item = `<div class="card shadow skeleton item-list">
      <div class="card-body ">
      <div class="row">
        
        <div class="col-md-8 col-sm-8 item-info">
          <h5 class="">Nama Anggota</h5>
          <p class="">No Hp</p>
          <p class="">ads</p>
          <p class="">asds</p>
        </div>
        <div class="col-md-4 col-sm-4">
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
                $(".list-data").on("click", ".btn-load-more", async function() {
                    getUsers($("#search").val());
                });
                $(".list-data").on("click", ".item-detail", async function() {
                    fetchJabatan().then(() => {
                        const data = $(this).data("detail");
                        $("#detailModal input,#detailModal select").attr("disabled", true);
                        $("#nama").val(data.nama);
                        $("#email").val(data.email);
                        $("#alamat").val(data.alamat);
                        $("#no_hp").val(data.no_hp);
                        $("#tglLahir").val(data.tglLahir);
                        $(`#agama option[value='${data.agama}']`).attr("selected", true);
                        $(`#jenis_kelamin option[value='${data.jenis_kelamin}']`).attr(
                            "selected",
                            true
                        );
                        $(`#jabatan option[value='${data.jabatan}']`).attr("selected", true);

                        $("#detailModal").modal("show");
                        $("#detailModal button[type=submit]").hide();
                    });
                });

                $(".list-data").on("click", ".item-edit", function() {
                    const data = $(this).data("detail");
                    fetchJabatan().then(() => {
                        $("#detailModal input,#detailModal select").removeAttr("disabled");
                        $("#nama").val(data.nama);
                        $("#email").val(data.email);
                        $("#alamat").val(data.alamat);
                        $("#no_hp").val(data.no_hp);
                        $("#tglLahir").val(data.tglLahir);
                        $(`#agama option[value='${data.agama}']`).attr("selected", true);
                        $(`#jenis_kelamin option[value='${data.jenis_kelamin}']`).attr(
                            "selected",
                            true
                        );
                        $(`#jabatan option[value='${data.jabatan}']`).attr("selected", true);
                        $("#detailModal").modal("show");
                        $("#detailModal").attr("data-id", data.id);
                        $("#detailModal button[type=submit]").show();
                    });
                });

                $(".list-data").on("click", ".item-setuju", function() {
                    const id = $(this).data("id");
                    const elemen = $(this);
                    $.confirm({
                        title: "Konfirmasi",
                        content: "Apakah anda yakin untuk menyetujui data ini?",
                        buttons: {
                            confirm: function() {
                                elemen.attr("disabled", true);
                                const temp = {};
                                temp.status = true;
                                temp.id = id;
                                updateUser(temp).then(() => {
                                    anggotaRepo.tambahAnggota();
                                    lastItem = null;
                                    getUsers();
                                });
                            },
                            cancel: function() {},
                        },
                    });
                });

                $("#detailModal").on("submit", "form", async function(e) {
                    e.preventDefault();
                    const id = $("#detailModal").attr("data-id");
                    $(this).find("button").attr("disabled", true);
                    const data = {
                        id: id,
                        nama: $("#nama").val(),
                        email: $("#email").val(),
                        alamat: $("#alamat").val(),
                        no_hp: $("#no_hp").val(),
                        tglLahir: new Date($("#tglLahir").val()).toISOString().slice(0, 10),
                        agama: $("#agama").val(),
                        jenis_kelamin: $("#jenis_kelamin").val(),
                        jabatan: doc(db, "jabatan", $("#jabatan").val()),
                    };
                    updateUser(data).then((result) => {
                        $("#detailModal").removeAttr("data-id");
                        $(this).find("button").removeAttr("disabled");
                        if (result.status) {
                            $("#detailModal").modal("hide");
                            lastItem = null;
                            getUsers();
                        }
                    });
                });

                $(".list-data").on("click", ".item-hapus", async function() {
                    const id = $(this).data("id");
                    if (id == getUserInfo().id) {
                        $.alert({
                            title: "Gagal",
                            content: "Anda tidak bisa menghapus akun anda sendiri",
                            buttons: {
                                confirm: function() {},
                            },
                        });
                    } else {
                        const element = $(this);
                        cekForeign(id).then((data) => {
                            let status = true;
                            data.forEach((item) => {
                                if (!item) {
                                    status = false;
                                }
                            });
                            if (!status) {
                                $.confirm({
                                    title: "Konfirmasi",
                                    content: "Apakah anda yakin untuk menonaktifkan akun ini?. Akun tidak bisa dihapus karena telah dipakai",
                                    buttons: {
                                        confirm: function() {
                                            element.attr("disabled", true);
                                            const user = {};
                                            user.id = id;
                                            user.status = false;
                                            user.nonaktif = true;
                                            updateUser(user).then(() => {
                                                anggotaRepo.kurangAnggota();
                                                lastItem = null;
                                                getUsers();
                                            });
                                        },
                                        cancel: function() {},
                                    },
                                });
                            } else {
                                $.confirm({
                                    title: "Konfirmasi",
                                    content: "Apakah anda yakin untuk menghapus data ini?",
                                    buttons: {
                                        confirm: function() {
                                            element.attr("disabled", true);
                                            deleteUser(id).then(() => {
                                                lastItem = null;
                                                getUsers();
                                            });
                                        },
                                        cancel: function() {},
                                    },
                                });
                            }
                        });
                    }
                });

                $("#btn-excel").on("click", exportExcel);

                $("#btn-pdf").on("click", exportPDF);
            };

            const getUsers = (search) => {
                    $("#btn-excel , #btn-pdf").prop("disabled", true);
                    $(".btn-load-more").remove();

                    fetchDataUser(true, search).then((data) => {
                                $(".card.shadow.skeleton.item-list").remove();
                                if (data.length == 0) {
                                    $(".list-data").html(elementNotFound);
                                } else {
                                    data.forEach((element, index) => {
                                                if (index < itemShow) {
                                                    let item = `<div class="card shadow item-list">
                        <div class="card-body">
                        <div class="row">
                        
                        <div class="col-md-8 col-sm-8 item-info">
                            <h5>${element.nama}</h5>
                            <p class="text-muted">${element.email}</p>
                            <p class="text-muted">${element.no_hp}</p>
                            <p class="text-muted">${element.alamat}</p>
                        </div>
                        <div class="col-md-4 col-sm-4">
                            <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
                                <button data-detail='${JSON.stringify(
                                  element
                                )}' class="btn btn-secondary btn-sm ml-2 item-detail"><i class="fa fa-info me-2"></i>Detail</button>
                                <button data-detail='${JSON.stringify(
                                  element
                                )}' class="btn btn-primary btn-sm ml-2 item-edit"><i class="fa fa-pencil me-2"></i>Edit</button>
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
                                <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
                                    <button data-detail='${JSON.stringify(
                                      element
                                    )}' class="btn btn-secondary btn-sm ml-2 item-detail"><i class="fa fa-info me-2"></i>Detail</button>
                                   ${
                                     element.nonaktif
                                       ? `<button data-id='${element.id}' class="btn btn-success btn-sm ml-2 item-setuju"><i class="fa fa-check me-2"></i>Aktifkan Akun</button>`
                                       : `<button data-id='${element.id}' class="btn btn-success btn-sm ml-2 item-setuju"><i class="fa fa-check me-2"></i>Setujui</button>
                                      <button  data-id='${element.id}' class="btn btn-danger btn-sm ml-2 item-hapus"><i class="fa fa-trash me-2"></i>Hapus</button>`
                                   }
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>`;
            }
            $(".list-data").append(item);
          } else {
            let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
            $(".list-data").append(loadMore);
          }
        });
      }
    });

    $("#btn-excel , #btn-pdf").removeAttr("disabled");
  };

  const exportExcel = () => {
    fetchDataUser().then(async (dataUser) => {
      dataUser = dataUser.sort((a, b) => {
        if (a.nama < b.nama) {
          return -1;
        }
      });
      const data = {
        nama: "Anggota",
        data: dataUser,
      };
      const pengaturan = doc(db, "pengaturan", "judul_cover");
      const organisasi = await getDoc(pengaturan);
      const nama = organisasi.data().value;

      // ExcelJS
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet 1");

      worksheet.columns = [
        { header: "Nama", key: "nama", width: 30 },
        { header: "Email", key: "email", width: 30 },
        { header: "No HP", key: "no_hp", width: 30 },
        { header: "Alamat", key: "alamat", width: 30 },
        { header: "Jabatan", key: "nama_jabatan", width: 30 },
      ];

      let maxRow = 4 + data.data.length + 2;
      const title = "Laporan Anggota Aktif";
      worksheet.mergeCells("A1", "E1");
      worksheet.getCell("A1").value = title;

      worksheet.mergeCells("A2", "E2");
      worksheet.getCell("A2").value = nama;

      worksheet.getRow(4).values = [
        "Nama",
        "Email",
        "No HP",
        "Alamat",
        "Jabatan",
      ];

      worksheet.addRows(data.data);

      maxRow++;
      worksheet.mergeCells("A" + maxRow, "E" + maxRow);
      worksheet.getCell("A" + maxRow).value =
        "Jumlah Anggota Aktif :" + data.data.length;
      maxRow++;
      worksheet.mergeCells("A" + maxRow, "E" + maxRow);
      worksheet.getCell("A" + maxRow).value =
        "Dicetak tanggal : " + new Date().toDateInputValue();

      worksheet.getCell("A1").font = {
        size: 13,
        bold: true,
        alignment: {
          horizontal: "center",
        },
      };
      worksheet.getCell("A2").font = {
        size: 12,
        alignment: {
          horizontal: "center",
        },
      };
      // Set table size each row
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell(function (Cell, cellNum) {
          if (rowNumber < 4) {
            Cell.alignment = {
              vertical: "center",
              horizontal: "center",
            };
          } else if (rowNumber > 4 + data.data.length + 2) {
            Cell.alignment = {
              vertical: "center",
              horizontal: "right",
            };
          } else {
            Cell.alignment = {
              vertical: "middle",
              horizontal: "middle",
            };
          }

          if (rowNumber == 4) {
            Cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFFF00" },
              bgColor: { argb: "FF0000FF" },
            };
            Cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        });
        if (rowNumber == 4 || rowNumber > 4 + data.data.length + 2) {
          row.font = { size: 12, bold: true };
        } else if (rowNumber > 4) {
          row.font = { size: 12 };
        }
      });
      workbook.xlsx
        .writeBuffer()
        .then((buffer) =>
          saveAs(new Blob([buffer]), `Laporan Anggota_${Date.now()}.xlsx`)
        )
        .catch((err) => console.log("Error writing excel export", err));
    });
  };

  const fetchDataUser = async (
    paginate = false,
    search = $("#search").val()
  ) => {
    const promise = [];
    let q;

    if (lastItem && paginate) {
      q = query(
        collection(db, "users"),
        orderBy("nama", "asc"),
        where("nama", ">=", search),
        where("nama", "<=", search + "~"),
        startAt(lastItem),
        limit(itemShow + 1)
      );
      itemLoad();
    } else if (paginate) {
      $(".list-data").empty();
      q = query(
        collection(db, "users"),
        where("nama", ">=", search),
        where("nama", "<=", search + "~"),
        orderBy("nama", "asc"),
        limit(itemShow + 1)
      );
      itemLoad();
    } else {
      q = query(collection(db, "users"), where("status", "==", true));
    }

    await getDocs(q).then((querySnapshot) => {
      if (paginate) {
        lastItem = querySnapshot.docs[querySnapshot.docs.length - 1];
      }
      querySnapshot.forEach((doc) => {
        const element = doc.data();
        element.id = doc.id;
        const data = getDoc(element.jabatan).then((jabatan) => {
          element.jabatan = jabatan.id;
          element.nama_jabatan = jabatan.data().jabatan;
          return element;
        });

        promise.push(data);
      });
    });

    return Promise.all(promise);
  };

  const exportPDF = () => {
    fetchDataUser().then(async (dataUser) => {
      // sort data by name
      dataUser = dataUser.sort((a, b) => {
        if (a.nama < b.nama) {
          return -1;
        }
      });
      const pengaturan = doc(db, "pengaturan", "judul_cover");
      const organisasi = await getDoc(pengaturan);
      const nama = organisasi.data().value;
      dokumen.autoTable({
        columns: [
          { header: "Nama", dataKey: "nama" },
          { header: "Alamat", dataKey: "alamat" },
          { header: "No Telp", dataKey: "no_hp" },
          { header: "Jabatan", dataKey: "nama_jabatan" },
        ],
        body: dataUser,
        margin: { top: 45 },
        didDrawPage: function (data) {
          var pageSize = dokumen.internal.pageSize;
          var pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

          if (data.pageNumber === 1) {
            dokumen.setFontSize(14);
            dokumen.setFontType("bold");
            const header = "Laporan Anggota Aktif";

            let textWidth =
              (dokumen.getStringUnitWidth(header) *
                dokumen.internal.getFontSize()) /
              dokumen.internal.scaleFactor;
            dokumen.text(header, (pageWidth - textWidth) / 2, 30);
            dokumen.setFontType("normal");
            dokumen.setFontSize(12);
            textWidth =
              (dokumen.getStringUnitWidth(nama) *
                dokumen.internal.getFontSize()) /
              dokumen.internal.scaleFactor;
            dokumen.text(nama, (pageWidth - textWidth) / 2, 37);
          }
          data.settings.margin.top = 10;
          // Footer
          var str = "Page " + dokumen.internal.getNumberOfPages();
          if (typeof dokumen.putTotalPages === "function") {
            str = str;
          }
          dokumen.setFontSize(10);
          dokumen.text(str, data.settings.margin.left, pageHeight - 10);
          dokumen.text(
            "© " + new Date().getFullYear(),
            pageWidth - 30,
            pageHeight - 10
          );
        },
      });
      dokumen.save(`Laporan Anggota_${Date.now()}.pdf`);
    });
  };

  const cekForeign = async (iduser) => {
    const collections = [
      {
        collection: "blogs",
        field: "author",
      },
      {
        collection: "kas",
        field: "user_id",
      },
    ];
    let promise = [];
    collections.forEach(async (data) => {
      const q = query(
        collection(db, data.collection),
        where(data.field, "==", doc(db, "users", iduser)),
        limit(1)
      );
      const prom = getDocs(q).then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          return false;
        } else {
          return true;
        }
      });
      promise.push(prom);
    });
    return Promise.all(promise);
  };

  $("#formSearch").on("submit", (e) => {
    e.preventDefault();
    if ($("#search").val() != "") {
      lastItem = null;
      getUsers($("#search").val());
    }
  });

  $("#search").on("search", function (evt) {
    if ($(this).val().length == 0) {
      lastItem = null;
      getUsers();
    }
  });

  itemEvent();
  getUsers();
});