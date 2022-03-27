import BulananRepository from "../repository/bulananRepository.js";
import KasRepository from "../repository/kasRepository.js";
$(document).ready(function() {
    const kasRepository = new KasRepository();
    //Format Uang
    $("input[name='jumlahUang']").on("keyup", function() {
        var jumlahUangRupiah = formatRupiah($(this).val());
        $("input[name='jumlahUang']").val(jumlahUangRupiah);
    });

    const createTagihan = () => {
        const data = {
            user_id: doc(db, "users", $("#select-anggota").val()),
            created_by: doc(db, "users", getUserInfo().id),
            created_at: new Date().toISOString(),
            update_at: new Date().toISOString(),
            jumlahUang: $("input[name='jumlahUang']").val(),
            keterangan: $("#keterangan").val(),
            status: $("#flagBayar").is(":checked"),
        };
        const kasBaru = doc(db, "kas", uuid("kas_"));
        return setDoc(kasBaru, data).then((docSnap) => {
            if (data.status) {
                addKeuangan({
                    keterangan: "Pembayaran Tagihan Kas",
                    nominal: data.jumlahUang,
                    tipe: "2",
                });
            }
            return responseResult(true, docSnap, "Berhasil menambahkan data");
        });
    };

    const itemLoad = () => {
        $(".list-data").empty();
        for (let i = 0; i < 4; i++) {
            const item = `<div class="card shadow skeleton item-list">
      <div class="card-body skeleton">
      <div class="row">
        
        <div class="col-md-9 col-sm-9 item-info">
          <h5 class="skeleton">a</h5>
          <p class="text-success fw-bold skeleton">a</p>
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

    const getDataTagihan = () => {
        itemLoad();
        const q = query(collection(db, "kas"));
        getDocs(q).then((docSnap) => {
            $(".list-data").empty();
            docSnap.forEach(async(docSnapshot) => {
                const dataTemp = docSnapshot.data();
                dataTemp.id = docSnapshot.id;

                //Ambil User
                const user = await getDoc(dataTemp.user_id);
                dataTemp.user = await user.data();

                let buttonBayar = "";

                if (dataTemp.status) {
                    buttonBayar = `<button class="btn btn-success btn-sm" disabled>
            <i class="fa fa-check me-1"> </i>Lunas
            </button>`;
                } else {
                    buttonBayar = `<button class="btn btn-primary btn-sm item-bayar"  data-id='${dataTemp.id}'>
            <i class="fa fa-money me-1"></i>Bayar
            </button>`;
                }
                let item = `<div class="card shadow item-list">
        <div class="card-body">
        <div class="row">
          
          <div class="col-md-9 col-sm-9 item-info">
            <h5>${dataTemp.user.nama}</h5>
            <p class="text-success fw-bold">${dataTemp.jumlahUang}</p>
            <small class="text-muted">${
              dataTemp.keterangan ? dataTemp.keterangan : "(Tanpa Deskripsi)"
            }</small><br/>
            <small class="text-muted">${format_date(
              dataTemp.created_at
            )}</small>
          </div>
          <div class="col-md-3 col-sm-3">
              <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
              ${buttonBayar} 
              <button data-id='${
                dataTemp.id
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

    const addKeuangan = (values) => {
        values.tanggalKeuangan = new Date().toISOString();
        values.user_id = doc(db, "users", getUserInfo().id);
        values.created_at = new Date().toISOString();
        values.nominal = parseInt(values.nominal.replace(/\./g, ""));
        const keuanganRepository = new BulananRepository(values.tanggalKeuangan);
        if (values.tipe == "2") {
            values.debit = values.nominal;
            values.kredit = 0;
            keuanganRepository.addPemasukan(values.nominal);
            kasRepository.tambahKas(values.nominal);
        } else {
            values.kredit = values.nominal;
            values.debit = 0;
            keuanganRepository.addPengeluaran(values.nominal);
            kasRepository.kurangKas(values.nominal);
        }

        const keuanganBaru = doc(db, "keuangan", uuid("keuangan_"));
        return setDoc(keuanganBaru, values).then((docSnap) => {
            return responseResult(true, docSnap, "Berhasil menambahkan data");
        });
    };

    const bayarTagihan = (id) => {
        const data = {
            status: true,
            update_at: new Date().toISOString(),
        };
        const dataRecent = doc(db, "kas", id);
        return getDoc(dataRecent).then((snap) => {
            const dataTemp = snap.data();
            addKeuangan({
                keterangan: "Pembayaran Tagihan Kas",
                nominal: dataTemp.jumlahUang,
                tipe: "2",
            });

            return updateDoc(dataRecent, data).then((docSnap) => {
                return responseResult(true, docSnap, "Berhasil mengubah data");
            });
        });
    };

    const hapusTagihan = (id) => {
        const dataRecent = doc(db, "kas", id);
        return getDoc(dataRecent).then((snap) => {
            const dataTemp = snap.data();
            if (dataTemp.status) {
                addKeuangan({
                    keterangan: "Penghapusan Tagihan Kas",
                    nominal: dataTemp.jumlahUang,
                    tipe: "1",
                });
            }
            return deleteDoc(dataRecent).then((docSnap) => {
                return responseResult(true, docSnap, "Berhasil menghapus data");
            });
        });
    };

    const itemEvent = () => {
        $(".list-data").on("click", ".item-hapus", async function() {
            const id = $(this).data("id");
            const element = $(this);
            $.confirm({
                title: "Konfirmasi",
                content: "Apakah anda yakin untuk menghapus data ini?",
                buttons: {
                    confirm: function() {
                        element.attr("disabled", true);
                        hapusTagihan(id).then(() => {
                            getDataTagihan();
                        });
                    },
                    cancel: function() {},
                },
            });
        });
        $(".list-data").on("click", ".item-bayar", async function() {
            const id = $(this).data("id");
            const element = $(this);
            $.confirm({
                title: "Konfirmasi",
                content: "Apakah anda yakin untuk membayar tagihan ini?",
                buttons: {
                    confirm: function() {
                        element.attr("disabled", true);
                        bayarTagihan(id).then(() => {
                            getDataTagihan();
                        });
                    },
                    cancel: function() {},
                },
            });
        });
    };

    $("#form-tagihan").submit(function(e) {
        e.preventDefault();
        createTagihan().then((docSnap) => {
            $("#form-tagihan")[0].reset();
            getDataTagihan();
        });
    });

    const getUsers = () => {
        const q = query(collection(db, "users"), where("status", "==", true));

        // Disable all input
        $("#form-tagihan").find("input").prop("disabled", true);
        getDocs(q).then(async(querySnapshot) => {
            $("#select-anggota").empty();
            querySnapshot.forEach(async(doc) => {
                const element = doc.data();
                element.id = doc.id;

                const option = `<option value="${element.id}">${element.nama}</option>`;
                $("#select-anggota").append(option);

                $("#form-tagihan").find("input").prop("disabled", false);
            });
        });
    };

    itemEvent();
    getUsers();
    getDataTagihan();
});