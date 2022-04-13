import BulananRepository from "../repository/bulananRepository.js?v=1.4";
import KasRepository from "../repository/kasRepository.js?v=1.3";
$(document).ready(function() {
    const kasRepository = new KasRepository();
    let idanggota = "";
    let lastItem;
    const itemShow = 5;

    $("#start-filter-date").val(new Date().toDateInputValue());
    $("#end-filter-date").val(new Date().toDateInputValue());

    //Format Uang
    $("input[name='jumlahUang']").on("keyup", function() {
        var jumlahUangRupiah = formatRupiah($(this).val());
        $("input[name='jumlahUang']").val(jumlahUangRupiah);
    });

    const createTagihan = () => {
        const data = {
            user_id: doc(db, "users", idanggota),
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
        if (!lastItem) {
            $(".list-data").empty();
        }
        for (let i = 0; i < itemShow; i++) {
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
        $("#refreshData").append("<i class='ms-2 fa fa-spinner'></i>");
        // disable refresh data
        $("#refreshData").attr("disabled", true);
        $(".btn-load-more").remove();
        fetchDataLaporan(true).then((docSnap) => {
            $("#refreshData").removeAttr("disabled");
            $(".fa-spinner").remove();
            var index = itemShow + 1;
            $(".card.shadow.skeleton.item-list").remove();
            if (docSnap.length == 0) {
                $(".list-data").append(elementNotFound);
                lastItem = null;
            }
            docSnap.forEach(async(dataTemp) => {
                index--;
                if (index > 0) {
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
                                    <p class="text-success fw-bold">${
                                      dataTemp.jumlahUang
                                    }</p>
                                    <small class="text-muted">${
                                      dataTemp.keterangan
                                        ? dataTemp.keterangan
                                        : "(Tanpa Deskripsi)"
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
                } else {
                    let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
                    $(".list-data").append(loadMore);
                }
            });
        });
    };

    const fetchDataLaporan = async(pagination = false) => {
        const promise = [];

        let q;
        if (pagination) {
            if (lastItem) {
                q = query(
                    collection(db, "kas"),
                    orderBy("created_at", "desc"),
                    where(
                        "created_at",
                        ">=",
                        new Date($("#start-filter-date").val()).toISOString()
                    ),
                    where(
                        "created_at",
                        "<=",
                        new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                    ),

                    startAt(lastItem),
                    limit(itemShow + 1)
                );
            } else {
                $(".list-data").empty();
                q = query(
                    collection(db, "kas"),
                    orderBy("created_at", "desc"),
                    where(
                        "created_at",
                        ">=",
                        new Date($("#start-filter-date").val()).toISOString()
                    ),
                    where(
                        "created_at",
                        "<=",
                        new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                    ),
                    limit(itemShow + 1)
                );
                itemLoad();
            }
        } else {
            q = query(
                collection(db, "kas"),
                where(
                    "created_at",
                    ">=",
                    new Date($("#start-filter-date").val()).toISOString()
                ),
                where(
                    "created_at",
                    "<=",
                    new Date($("#end-filter-date").val() + " 23:59:59").toISOString()
                ),
                orderBy("created_at", "desc")
            );
        }
        await getDocs(q).then((docSnap) => {
            if (pagination) {
                lastItem = docSnap.docs[docSnap.docs.length - 1];
            }
            docSnap.forEach(async(docSnapshot) => {
                const dataTemp = docSnapshot.data();
                dataTemp.id = docSnapshot.id;
                //Ambil User
                const data = getDoc(dataTemp.user_id).then((user) => {
                    dataTemp.user = user.data();
                    return dataTemp;
                });

                promise.push(data);
            });
        });
        return Promise.all(promise);
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

    const exportExcel = async() => {
        await fetchDataLaporan().then(async(result) => {
            const data = {
                nama: "Kas",
                data: [],
            };

            let sudah_dibayar = 0;
            let belum_dibayar = 0;
            const pengaturan = doc(db, "pengaturan", "judul_cover");
            const organisasi = await getDoc(pengaturan);
            const nama = organisasi.data().value;
            const tanggal =
                new Date($("#start-filter-date").val()).toISOString().slice(0, 10) +
                " - " +
                new Date($("#end-filter-date").val()).toISOString().slice(0, 10);

            data.data = result.map((item) => {
                if (item.status) {
                    sudah_dibayar += parseInt(item.jumlahUang.replace(".", ""));
                } else {
                    belum_dibayar += parseInt(item.jumlahUang.replace(".", ""));
                }
                return {
                    tanggal: format_date(item.created_at),
                    untuk: item.user.nama,
                    jumlahUang: item.jumlahUang,
                    status: item.status ? "Sudah Dibayar" : "Belum dibayar",
                };
            });
            // ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sheet 1");
            worksheet.columns = [
                { header: "Nama", key: "untuk", width: 30 },
                { header: "Tanggal Tagihan", key: "tanggal", width: 30 },
                { header: "Nominal", key: "jumlahUang", width: 30 },
                { header: "Status", key: "status", width: 30 },
            ];

            let maxRow = 5 + data.data.length + 2;
            const title = "Laporan Kas";
            worksheet.mergeCells("A1", "D1");
            worksheet.getCell("A1").value = title;

            worksheet.mergeCells("A2", "D2");
            worksheet.getCell("A2").value = nama;

            worksheet.mergeCells("A3", "D3");
            worksheet.getCell("A3").value = tanggal;

            worksheet.getRow(5).values = [
                "Nama",
                "Tanggal Tagihan",
                "Nominal",
                "Status",
            ];

            worksheet.addRows(data.data);

            maxRow++;
            worksheet.mergeCells("A" + maxRow, "D" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Total Tagihan terbayar : " + formatRupiah(sudah_dibayar.toString());
            maxRow++;
            worksheet.mergeCells("A" + maxRow, "D" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Total Tagihan belum terbayar: " +
                formatRupiah(belum_dibayar.toString());
            maxRow++;
            worksheet.mergeCells("A" + maxRow, "D" + maxRow);
            worksheet.getCell("A" + maxRow).value =
                "Total Akhir : " +
                formatRupiah((sudah_dibayar + belum_dibayar).toString());
            maxRow++;
            worksheet.mergeCells("A" + maxRow, "D" + maxRow);
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
                        cellNum == 3 &&
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
                    saveAs(new Blob([buffer]), `Laporan Kas_${Date.now()}.xlsx`)
                )
                .catch((err) => console.log("Error writing excel export", err));
        });
    };

    const exportPDF = async() => {
        await fetchDataLaporan().then(async(result) => {
            const dokumen = new jsPDF();
            const pengaturan = doc(db, "pengaturan", "judul_cover");
            const organisasi = await getDoc(pengaturan);
            const nama = organisasi.data().value;
            const tanggal =
                new Date($("#start-filter-date").val()).toISOString().slice(0, 10) +
                " - " +
                new Date($("#end-filter-date").val()).toISOString().slice(0, 10);
            const data = result.map((item) => {
                return {
                    tanggal: format_date(item.created_at),
                    untuk: item.user.nama,
                    jumlahUang: item.jumlahUang,
                    status: item.status ? "Sudah Dibayar" : "Belum dibayar",
                };
            });
            dokumen.autoTable({
                columns: [
                    { header: "Nama", dataKey: "untuk" },
                    { header: "Tanggal Tagihan", dataKey: "tanggal" },
                    { header: "Nominal", dataKey: "jumlahUang" },
                    { header: "Status", dataKey: "status" },
                ],
                body: data,
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
                        const header = "Laporan Kas";

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
                        "© " + new Date().getFullYear(),
                        pageWidth - 30,
                        pageHeight - 10
                    );
                },
            });
            dokumen.save(`Laporan Kas_${Date.now()}.pdf`);
        });
    };

    const itemEvent = () => {
        $(".list-data").on("click", ".btn-load-more", async function() {
            getDataTagihan();
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
                        hapusTagihan(id).then(() => {
                            lastItem = null;
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
                            lastItem = null;
                            getDataTagihan();
                        });
                    },
                    cancel: function() {},
                },
            });
        });

        $("#btn-excel").on("click", exportExcel);

        $("#btn-pdf").on("click", exportPDF);
    };

    $("#form-tagihan").submit(function(e) {
        e.preventDefault();
        createTagihan().then((docSnap) => {
            $("#form-tagihan")[0].reset();
            $("#form-tagihan button[type='submit']").prop("disabled", true);
            lastItem = null;
            getDataTagihan();
        });
    });

    const getUsers = () => {
        const q = query(collection(db, "users"), where("status", "==", true));

        // Disable all input
        $("#form-tagihan").find("input").prop("disabled", true);
        getDocs(q).then(async(querySnapshot) => {
            $("#anggotalist").empty();
            querySnapshot.forEach(async(doc) => {
                const element = doc.data();
                element.id = doc.id;

                const options = `<option value="${element.nama}" data-value="${element.id}"/>`;
                $("#anggotaList").append(options);
                $("#form-tagihan").find("input").prop("disabled", false);
            });
        });
    };

    $("#form-tagihan").on("keydown", "input, select", function(e) {
        if (e.which === 13) {
            var self = $(this),
                form = self.parents("form:eq(0)"),
                focusable,
                next;
            focusable = form.find("input").filter(":visible");
            next = focusable.eq(focusable.index(this) + 1);
            if (next.length) {
                next.focus();
            }
            return false;
        }
    });

    $("#form-tagihan button[type='submit']").prop("disabled", true);

    $("#anggota_select").on("input", function(e) {
        var value = $(this).val();
        const messageError =
            '<small id="errorAnggota" class="text-danger">Pilih salah satu anggota.</small>';

        if ($('#anggotaList [value="' + value + '"]').data("value")) {
            if ($("#errorAnggota").length > 0) {
                $("#errorAnggota").remove();
            }
            idanggota = $('#anggotaList [value="' + value + '"]').data("value");
            $("#form-tagihan button[type='submit']").prop("disabled", false);
        } else {
            if ($("#errorAnggota").length == 0) {
                $(this).after(messageError);
            }
            $("#form-tagihan button[type='submit']").prop("disabled", true);
        }
    });

    $("#refreshData").on("click", function() {
        lastItem = null;
        getDataTagihan();
    });

    itemEvent();
    getUsers();
    getDataTagihan();
});