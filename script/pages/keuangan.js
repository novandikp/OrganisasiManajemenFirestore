import KeuanganRepository from "../repository/keuanganRepository.js";
$(document).ready(function () {
  const keuanganRepository = new KeuanganRepository();
  //Default Value untuk Tanggal
  $("#start-filter-date").val(new Date().toDateInputValue());
  $("#end-filter-date").val(new Date().toDateInputValue());
  $("#tanggalKeuangan").val(new Date().toDateInputValue());

  //Keuangan
  $("#nominal").on("keyup", function () {
    $(this).val(formatRupiah($(this).val()));
  });

  const fetchSaldo = () => {
    keuanganRepository.getSaldo().then((saldo) => {
      if (saldo >= 0) {
        $("#saldo").text("Rp. " + formatRupiah(saldo.toString()));
      } else {
        $("#saldo").text("-Rp. " + formatRupiah(saldo.toString()));
      }
    });
  };

  const addKeuangan = () => {
    let values = {};
    $("#formKeuangan")
      .serializeArray()
      .forEach((element) => {
        values[element.name] = element.value;
      });
    values.tanggalKeuangan = new Date(values.tanggalKeuangan).toISOString();
    values.user_id = doc(db, "users", getUserInfo().id);
    values.created_at = new Date().toISOString();
    values.nominal = parseInt(values.nominal.replace(/\./g, ""));
    if (values.tipe == "2") {
      values.debit = values.nominal;
      values.kredit = 0;
      keuanganRepository.addPemasukan(values.nominal);
    } else {
      values.kredit = values.nominal;
      values.debit = 0;
      keuanganRepository.addPengeluaran(values.nominal);
    }

    const keuanganBaru = doc(db, "keuangan", uuid("keuangan_"));
    return setDoc(keuanganBaru, values).then((docSnap) => {
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

  const getDataKeuangan = () => {
    itemLoad();

    const q = query(
      collection(db, "keuangan"),
      orderBy("tanggalKeuangan", "desc"),
      orderBy("created_at", "desc")
    );
    getDocs(q).then((docSnap) => {
      $(".list-data").empty();
      docSnap.forEach(async (docSnapshot) => {
        const dataTemp = docSnapshot.data();
        dataTemp.id = docSnapshot.id;
        console.log(dataTemp);
        let item = `<div class="card shadow item-list">
        <div class="card-body">
        <div class="row">
          
          <div class="col-md-9 col-sm-9 item-info">
            <h5 class="${
              dataTemp.debit == 0 ? "text-danger" : "text-success"
            }">${formatRupiah(dataTemp.nominal.toString())}</h5>
            <small class="text-muted">${
              dataTemp.keterangan ? dataTemp.keterangan : "(Tanpa Deskripsi)"
            }</small><br/>
            <small class="text-muted">${format_date(
              dataTemp.tanggalKeuangan
            )}</small>
          </div>
          <div class="col-md-3 col-sm-3">
              <div class="float-sm-right d-grid gap-2 d-xl-block mt-3">
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
      fetchSaldo();
    });
  };

  $("#formKeuangan").on("submit", function (e) {
    e.preventDefault();
    addKeuangan().then(() => {
      $("#formKeuangan").trigger("reset");
      getDataKeuangan();
    });
  });

  getDataKeuangan();
});
