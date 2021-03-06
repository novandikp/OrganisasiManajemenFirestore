import KeuanganRepository from "../repository/keuanganRepository.js?v=1.3";
import BulananRepository from "../repository/bulananRepository.js?v=1.4";
$(document).ready(function() {
    const itemShow = 5;
    let lastItem;

    const keuanganRepository = new KeuanganRepository();
    //Default Value untuk Tanggal
    $("#start-filter-date").val(new Date().toDateInputValue());
    $("#end-filter-date").val(new Date().toDateInputValue());
    $("#tanggalKeuangan").val(new Date().toDateInputValue());

    //Keuangan
    $("#nominal").on("keyup", function() {
        $(this).val(formatRupiah($(this).val()));
    });

    const getTime = () => {
        const now = new Date();

        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();

        if (hour.toString().length == 1) {
            hour = "0" + hour;
        }
        if (minute.toString().length == 1) {
            minute = "0" + minute;
        }
        if (second.toString().length == 1) {
            second = "0" + second;
        }

        return hour + ":" + minute + ":" + second;
    };

    const addKeuangan = () => {
        let values = {};
        $("#formKeuangan")
            .serializeArray()
            .forEach((element) => {
                values[element.name] = element.value;
            });
        const now = new Date();
        values.tanggalKeuangan = new Date(
            values.tanggalKeuangan + " " + getTime()
        ).toISOString();
        values.user_id = doc(db, "users", getUserInfo().id);
        values.created_at = now.toISOString();
        values.nominal = parseInt(values.nominal.replace(/\./g, ""));
        const bulanRepo = new BulananRepository(values.tanggalKeuangan);
        if (values.tipe == "2") {
            values.debit = values.nominal;
            values.kredit = 0;
            bulanRepo.addPemasukan(values.nominal);
        } else {
            values.kredit = values.nominal;
            values.debit = 0;
            bulanRepo.addPengeluaran(values.nominal);
        }

        const keuanganBaru = doc(db, "keuangan", uuid("keuangan_"));
        return setDoc(keuanganBaru, values).then((docSnap) => {
            return responseResult(true, docSnap, "Berhasil menambahkan data");
        });
    };

    const deleteKeuangan = (id) => {
        const recentData = doc(db, "keuangan", id);
        return getDoc(recentData).then((data) => {
            const dataTemp = data.data();
            const bulanRepo = new BulananRepository(dataTemp.tanggalKeuangan);
            if (dataTemp.debit == 0) {
                bulanRepo.addPemasukan(dataTemp.nominal);
            } else {
                bulanRepo.addPengeluaran(dataTemp.nominal);
            }
            return deleteDoc(recentData);
        });
    };

    const itemEvent = () => {
        $("#btn-excel").on("click", exportExcel);

        $("#btn-pdf").on("click", exportPDF);
        $(".list-data").on("click", ".btn-load-more", async function() {
            getDataKeuangan();
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
                        deleteKeuangan(id).then((data) => {
                            lastItem = null;
                            getDataKeuangan();
                        });
                    },
                    cancel: function() {},
                },
            });
        });
    };

    const itemLoad = () => {
        if (!lastItem) {
            $(".list-data").empty();
        }
        $(".btn-load-more").remove();
        for (let i = 0; i < itemShow; i++) {
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
        $("#refreshData").append("<i class='ms-2 fa fa-spinner'></i>");
        // disable refresh data
        $("#refreshData").attr("disabled", true);
        fetchDataKeuangan(true).then((docSnap) => {
            let index = itemShow + 1;
            $(".skeleton.item-list").remove();
            $("#refreshData").removeAttr("disabled");
            $(".fa-spinner").remove();
            if (docSnap.saldo >= 0) {
                $("#saldo").text("Rp. " + formatRupiah(docSnap.saldo.toString()));
            } else {
                $("#saldo").text("-Rp. " + formatRupiah(docSnap.saldo.toString()));
            }

            if (docSnap.data.length == 0) {
                $(".list-data").append(elementNotFound);
                lastItem = null;
            }

            docSnap.data.forEach(async(dataTemp) => {
                index--;
                if (index > 0) {
                    let item = `<div class="card shadow item-list">
                <div class="card-body">
                <div class="row">
                  
                  <div class="col-md-9 col-sm-9 item-info">
                    <h5 class="${
                      dataTemp.debit == 0 ? "text-danger" : "text-success"
                    }">${formatRupiah(dataTemp.nominal.toString())}</h5>
                    <small class="text-muted">${
                      dataTemp.keterangan
                        ? dataTemp.keterangan
                        : "(Tanpa Deskripsi)"
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

                    console.log(dataTemp);
                } else {
                    let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
                    $(".list-data").append(loadMore);
                }
            });
            if (docSnap.saldo >= 0) {
                $("#saldo").text("Rp. " + formatRupiah(docSnap.saldo.toString()));
            } else {
                $("#saldo").text("-Rp. " + formatRupiah(docSnap.saldo.toString()));
            }
        });
    };

    const fetchDataKeuangan = async(pagination = false) => {
        let q;
        let promise = { saldo: 0, data: [], saldoMuncul: 0 };

        if (pagination) {
            if (lastItem) {
                q = query(
                    collection(db, "keuangan"),

                    orderBy("tanggalKeuangan", "desc"),
                    orderBy("created_at", "desc"),
                    where(
                        "tanggalKeuangan",
                        ">=",
                        new Date($("#start-filter-date").val()).toISOString()
                    ),
                    where(
                        "tanggalKeuangan",
                        "<=",
                        new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                    ),
                    startAt(lastItem),
                    limit(itemShow + 1)
                );
            } else {
                $(".list-data").empty();
                q = query(
                    collection(db, "keuangan"),

                    orderBy("tanggalKeuangan", "desc"),
                    orderBy("created_at", "desc"),
                    where(
                        "tanggalKeuangan",
                        ">=",
                        new Date($("#start-filter-date").val()).toISOString()
                    ),
                    where(
                        "tanggalKeuangan",
                        "<=",
                        new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                    ),
                    limit(itemShow + 1)
                );
            }
            itemLoad();
        } else {
            q = query(
                collection(db, "keuangan"),

                orderBy("tanggalKeuangan", "asc"),
                where(
                    "tanggalKeuangan",
                    ">=",
                    new Date($("#start-filter-date").val()).toISOString()
                ),
                where(
                    "tanggalKeuangan",
                    "<=",
                    new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                )
            );
        }

        await keuanganRepository.getSaldo().then(async(saldo) => {
            promise.saldo = saldo;
            return getDocs(q).then((docSnap) => {
                lastItem = docSnap.docs[docSnap.docs.length - 1];
                docSnap.forEach(async(docSnapshot) => {
                    const dataTemp = docSnapshot.data();
                    promise.saldoMuncul += dataTemp.debit;
                    promise.saldoMuncul -= dataTemp.kredit;
                    dataTemp.id = docSnapshot.id;
                    promise.data.push(dataTemp);
                });
            });
        });

        return promise;
    };

    const exportExcel = async() => {
        await fetchDataKeuangan().then(async(result) => {
            const data = {
                nama: "Keuangan",
                data: [],
            };
            const pengaturan = doc(db, "pengaturan", "judul_cover");
            const organisasi = await getDoc(pengaturan);
            const nama = organisasi.data().value;
            const tanggal =
                new Date($("#start-filter-date").val()).toISOString().slice(0, 10) +
                " - " +
                new Date($("#end-filter-date").val()).toISOString().slice(0, 10);

            let pemasukan = 0;
            let pengeluaran = 0;
            let sisaSaldo = result.saldo - result.saldoMuncul;
            data.data = result.data.map((item) => {
                sisaSaldo += item.debit;
                sisaSaldo -= item.kredit;

                pemasukan += item.debit;
                pengeluaran -= item.kredit;
                return {
                    tanggalKeuangan: format_date(item.tanggalKeuangan),
                    keterangan: item.keterangan,
                    debit: formatRupiah(item.debit.toString()),
                    kredit: formatRupiah(item.kredit.toString()),
                    saldo: formatRupiah(sisaSaldo.toString()),
                };
            });

            if (result.saldo - result.saldoMuncul != 0) {
                pemasukan +=
                    result.saldo - result.saldoMuncul > 0 ?
                    result.saldo - result.saldoMuncul :
                    0;
                pengeluaran +=
                    result.saldo - result.saldoMuncul < 0 ?
                    result.saldo - result.saldoMuncul :
                    0;
                data.data.splice(0, 0, {
                    tanggalKeuangan: "-",
                    debit: result.saldo - result.saldoMuncul > 0 ?
                        formatRupiah((result.saldo - result.saldoMuncul).toString()) :
                        "0",
                    kredit: result.saldo - result.saldoMuncul < 0 ?
                        formatRupiah(
                            ((result.saldo - result.saldoMuncul) * -1).toString()
                        ) :
                        "0",
                    keterangan: "Saldo Awal",
                    saldo: formatRupiah((result.saldo - result.saldoMuncul).toString()),
                });
            }
            // ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet 1");
            worksheet.columns = [
                { header: "Tanggal Keuangan", key: "tanggalKeuangan", width: 30 },
                { header: "Keterangan", key: "keterangan", width: 30 },
                { header: "Masuk", key: "debit", width: 30 },
                { header: "Keluar", key: "kredit", width: 30 },
                { header: "Saldo", key: "saldo", width: 30 },
            ];

            let maxRow = 5 + data.data.length + 2;
            const title = "Laporan Keuangan";
            worksheet.mergeCells("A1", "E1");
            worksheet.getCell("A1").value = title;

            worksheet.mergeCells("A2", "E2");
            worksheet.getCell("A2").value = nama;

            worksheet.mergeCells("A3", "E3");
            worksheet.getCell("A3").value = tanggal;

            worksheet.getRow(5).values = [
                "Tanggal Keuangan",
                "Keterangan",
                "Masuk",
                "Keluar",
                "Saldo",
            ];

            worksheet.addRows(data.data);

            maxRow++;
            worksheet.mergeCells("A" + maxRow, "E" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Jumlah Pemasukan : " + formatRupiah(pemasukan.toString());
            maxRow++;
            worksheet.mergeCells("A" + maxRow, "E" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Jumlah Pengeluaran : " + formatRupiah(pengeluaran.toString());
            maxRow++;
            worksheet.mergeCells("A" + maxRow, "E" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Saldo Akhir : " + formatRupiah((pemasukan + pengeluaran).toString());
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
            worksheet.getCell("A3").font = {
                size: 12,
                alignment: {
                    horizontal: "center",
                },
            };
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell(function(Cell, cellNum) {
                    if (rowNumber < 5) {
                        Cell.alignment = {
                            vertical: "center",
                            horizontal: "center",
                        };
                    } else if (rowNumber > 5 + data.data.length + 2) {
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

                    if (rowNumber == 5) {
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

                    if (
                        cellNum > 2 &&
                        rowNumber > 5 &&
                        rowNumber < 5 + data.data.length + 2
                    ) {
                        Cell.alignment = {
                            vertical: "center",
                            horizontal: "right",
                        };
                    }
                });
                if (rowNumber == 5 || rowNumber > 5 + data.data.length + 2) {
                    row.font = { size: 12, bold: true };
                } else if (rowNumber > 5) {
                    row.font = { size: 12 };
                }
            });

            workbook.xlsx
                .writeBuffer()
                .then((buffer) =>
                    saveAs(new Blob([buffer]), `Laporan Keuangan_${Date.now()}.xlsx`)
                )
                .catch((err) => console.log("Error writing excel export", err));
        });
    };

    const exportPDF = async() => {
        await fetchDataKeuangan().then(async(result) => {
            const dokumen = new jsPDF();
            const pengaturan = doc(db, "pengaturan", "judul_cover");
            const organisasi = await getDoc(pengaturan);
            const nama = organisasi.data().value;
            const tanggal =
                new Date($("#start-filter-date").val()).toISOString().slice(0, 10) +
                " - " +
                new Date($("#end-filter-date").val()).toISOString().slice(0, 10);

            let sisaSaldo = result.saldo - result.saldoMuncul;
            const dataBaru = result.data.map((item) => {
                sisaSaldo += item.debit;
                sisaSaldo -= item.kredit;
                return {
                    tanggalKeuangan: format_date(item.tanggalKeuangan),
                    keterangan: item.keterangan,
                    debit: formatRupiah(item.debit.toString()),
                    kredit: formatRupiah(item.kredit.toString()),
                    saldo: formatRupiah(sisaSaldo.toString()),
                };
            });
            if (result.saldo - result.saldoMuncul != 0) {
                dataBaru.splice(0, 0, {
                    tanggalKeuangan: "-",
                    debit: result.saldo - result.saldoMuncul > 0 ?
                        formatRupiah((result.saldo - result.saldoMuncul).toString()) :
                        "0",
                    kredit: result.saldo - result.saldoMuncul < 0 ?
                        formatRupiah(
                            ((result.saldo - result.saldoMuncul) * -1).toString()
                        ) :
                        "0",
                    keterangan: "Saldo Awal",
                    saldo: formatRupiah((result.saldo - result.saldoMuncul).toString()),
                });
            }
            dokumen.autoTable({
                columns: [
                    { header: "Tanggal Keuangan", dataKey: "tanggalKeuangan" },
                    { header: "Keterangan", dataKey: "keterangan" },
                    { header: "Masuk", dataKey: "debit" },
                    { header: "Keluar", dataKey: "kredit" },
                    { header: "Saldo", dataKey: "saldo" },
                ],
                body: dataBaru,
                margin: { top: 51 },
                didDrawPage: function(data) {
                    var pageSize = dokumen.internal.pageSize;
                    var pageHeight = pageSize.height ?
                        pageSize.height :
                        pageSize.getHeight();
                    var pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

                    if (data.pageNumber === 1) {
                        dokumen.setFontSize(14);
                        dokumen.setFontType("bold");
                        const header = "Laporan Keuangan";

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

                        textWidth =
                            (dokumen.getStringUnitWidth(tanggal) *
                                dokumen.internal.getFontSize()) /
                            dokumen.internal.scaleFactor;
                        dokumen.text(tanggal, (pageWidth - textWidth) / 2, 44);
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
                        "?? " + new Date().getFullYear(),
                        pageWidth - 30,
                        pageHeight - 10
                    );
                },
            });
            dokumen.save(`Laporan Keuangan_${Date.now()}.pdf`);
        });
    };

    $("#refreshData").on("click", function() {
        lastItem = null;
        getDataKeuangan();
    });

    $("#formKeuangan").on("submit", function(e) {
        e.preventDefault();
        addKeuangan().then(() => {
            $("#formKeuangan").trigger("reset");

            $("#tanggalKeuangan").val(new Date().toDateInputValue());
            lastItem = null;
            getDataKeuangan();
        });
    });

    itemEvent();
    getDataKeuangan();
});