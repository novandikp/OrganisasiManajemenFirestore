$(document).ready(function() {
    let chartBar,
        chartPie,
        chartBarAgama,
        chartPieAgama,
        chartBarJenisKelamin,
        chartPieJenisKelamin,
        chartBarUmur,
        chartPieUmur,
        chartBarBlogView,
        chartPieBlogView;

    const AnggotaRekap = {
        agama: {
            header: ["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Konghucu"],
            value: [0, 0, 0, 0, 0, 0],
        },
        jenis_kelamin: {
            header: ["Pria", "Wanita"],
            value: [0, 0],
        },
        umur: {
            header: [],
            value: [],
        },
    };
    const fillRekap = () => {
        getDocs(collection(db, "rekap")).then((docs) => {
            docs.forEach((element) => {
                let data = element.data();
                let id = element.id;
                $("#rekap_" + id).text(formatRupiah(data.value.toString()));
            });

            $(".skeleton").removeClass("skeleton");
        });
    };

    const chartRekap = () => {
        const year = new Date().getFullYear();
        const q = query(
            collection(db, "rekap_bulanan"),
            where("tahun", "==", year)
        );
        getDocs(q).then((docs) => {
            let data = { value: [], id: [] };
            docs.forEach((element) => {
                let id = element.id;
                let dataTemp = element.data();
                if (dataTemp.saldo > 0) {
                    data.value.push(dataTemp.saldo);
                    data.id.push(dataTemp.nama_bulan);
                }
            });

            setDataChart(data);
        });
    };

    const setDataChart = (rekap) => {
        const color = randomColor(rekap.id.length);
        const data = {
            labels: rekap.id,
            datasets: [{
                label: rekap.id,
                backgroundColor: color,
                borderColor: color,
                data: rekap.value,
            }, ],
        };

        if (chartBar) chartBar.destroy();
        if (chartPie) chartPie.destroy();

        // Atur data chart
        chartPie = new Chart($("#chartPie"), getConfig(data, "pie"));
        // Ubah legend menjadi jumlah mahasiswa
        data.datasets[0].label = "Rekap Bulanan";
        chartBar = new Chart($("#chartBar"), getConfig(data, "bar"));
    };

    // Mendapatkan config chart sesuai jenis
    const getConfig = (data, type = "pie") => {
        const config = {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === "pie" ? true : false,
                    },
                },
            },
        };
        return config;
    };

    const randomColor = (length) => {
        let colorSelected = [
            "rgba(132, 94, 194,0.65)",
            "rgba(214, 93, 177,0.65)",
            "rgba(255, 111, 145,0.65)",
            "rgba(255, 150, 113,0.65)",
            "rgba(255, 199, 95,0.65)",
            "rgba(0, 201, 167,0.65)",
            "rgba(0, 137, 186,0.65)",
            "rgba(132, 94, 194,0.65)",
            "rgba(44, 115, 210,0.65)",
            "rgba(0, 129, 207,0.65)",
            "rgba(0, 142, 155,0.65)",
            "rgba(0, 139, 201,0.65)",
        ];
        colorSelected.length = length;
        return colorSelected;
    };
    const borderColor = (length) => {
        let colorSelected = [
            "rgba(132, 94, 194)",
            "rgba(214, 93, 177)",
            "rgba(255, 111, 145)",
            "rgba(255, 150, 113)",
            "rgba(255, 199, 95)",
            "rgba(0, 201, 167)",
            "rgba(0, 137, 186)",
            "rgba(132, 94, 194)",
            "rgba(44, 115, 210)",
            "rgba(0, 129, 207)",
            "rgba(0, 142, 155)",
            "rgba(0, 139, 201)",
        ];
        colorSelected.length = length;
        return colorSelected;
    };

    const fetchDataUser = async() => {
        const promise = [];
        const q = query(collection(db, "users"), where("status", "==", true));

        await getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const element = doc.data();
                element.id = doc.id;

                promise.push(element);
            });
        });

        return Promise.all(promise);
    };

    const getBlogs = async() => {
        const promise = [];
        const q = query(collection(db, "blogs"));

        await getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const element = doc.data();
                element.id = doc.id;

                promise.push(element);
            });
        });

        return Promise.all(promise);
    };

    const setAgamaChart = () => {
        let dataAgama = {
            labels: AnggotaRekap.agama.header,
            datasets: [{
                label: "Agama",
                backgroundColor: randomColor(AnggotaRekap.agama.header.length),
                borderColor: borderColor(AnggotaRekap.agama.header.length),
                data: AnggotaRekap.agama.value,
            }, ],
        };

        if (chartBarAgama) chartBarAgama.destroy();
        if (chartPieAgama) chartPieAgama.destroy();

        chartBarAgama = new Chart($("#chartBarAgama"), getConfig(dataAgama, "bar"));
        chartPieAgama = new Chart($("#chartPieAgama"), getConfig(dataAgama, "pie"));
    };

    const setJenisKelaminChart = () => {
        let dataJenisKelamin = {
            labels: AnggotaRekap.jenis_kelamin.header,
            datasets: [{
                label: "Jenis Kelamin",
                backgroundColor: randomColor(
                    AnggotaRekap.jenis_kelamin.header.length
                ),
                borderColor: borderColor(AnggotaRekap.jenis_kelamin.header.length),
                data: AnggotaRekap.jenis_kelamin.value,
            }, ],
        };

        if (chartBarJenisKelamin) chartBarJenisKelamin.destroy();
        if (chartPieJenisKelamin) chartPieJenisKelamin.destroy();

        chartBarJenisKelamin = new Chart(
            $("#chartBarJenisKelamin"),
            getConfig(dataJenisKelamin, "bar")
        );
        chartPieJenisKelamin = new Chart(
            $("#chartPieJenisKelamin"),
            getConfig(dataJenisKelamin, "pie")
        );
    };

    const setUmurChart = () => {
        let dataUmur = {
            labels: AnggotaRekap.umur.header,
            datasets: [{
                label: "Umur",
                backgroundColor: randomColor(AnggotaRekap.umur.header.length),
                borderColor: borderColor(AnggotaRekap.umur.header.length),
                data: AnggotaRekap.umur.value,
            }, ],
        };

        if (chartBarUmur) chartBarUmur.destroy();
        if (chartPieUmur) chartPieUmur.destroy();

        chartBarUmur = new Chart($("#chartBarUmur"), getConfig(dataUmur, "bar"));
        chartPieUmur = new Chart($("#chartPieUmur"), getConfig(dataUmur, "pie"));
    };

    const setBlogViewChart = (data) => {
        let dataBlogView = {
            labels: data.labels,
            datasets: [{
                label: "Jumlah Blog",
                backgroundColor: randomColor(data.labels.length),
                borderColor: borderColor(data.labels.length),
                data: data.data,
            }, ],
        };

        if (chartBarBlogView) chartBarBlogView.destroy();
        if (chartPieBlogView) chartPieBlogView.destroy();

        chartBarBlogView = new Chart(
            $("#chartBarBlogView"),
            getConfig(dataBlogView, "bar")
        );
        chartPieBlogView = new Chart(
            $("#chartPieBlogView"),
            getConfig(dataBlogView, "pie")
        );
    };

    fetchDataUser().then((data) => {
        data.forEach((user) => {
            //  Agama
            if (user.agama) {
                if (AnggotaRekap.agama.header.indexOf(user.agama) >= 0) {
                    AnggotaRekap.agama.value[
                        AnggotaRekap.agama.header.indexOf(user.agama)
                    ] += 1;
                }
            }
            // Jenis Kelamin
            if (user.jenis_kelamin) {
                if (
                    AnggotaRekap.jenis_kelamin.header.indexOf(user.jenis_kelamin) >= 0
                ) {
                    AnggotaRekap.jenis_kelamin.value[
                        AnggotaRekap.jenis_kelamin.header.indexOf(user.jenis_kelamin)
                    ] += 1;
                }
            }

            if (user.tglLahir) {
                user.tglLahir = new Date(user.tglLahir);
                if (
                    AnggotaRekap.umur.header.indexOf(getAge(user.tglLahir) + " tahun") >=
                    0
                ) {
                    AnggotaRekap.umur.value[
                        AnggotaRekap.umur.header.indexOf(getAge(user.tglLahir) + " tahun")
                    ] += 1;
                } else {
                    AnggotaRekap.umur.header.push(getAge(user.tglLahir) + " tahun");
                    AnggotaRekap.umur.value.push(1);
                }
            }
        });

        console.log(AnggotaRekap);
        setAgamaChart();
        setJenisKelaminChart();
        setUmurChart();
    });

    getBlogs().then((data) => {
        const monthName = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];
        const rekap = {
            labels: [],
            data: [],
        };

        data.forEach((blog) => {
            const bulan = monthName[new Date(blog.created_at).getMonth()];
            if (rekap.labels.indexOf(bulan) >= 0) {
                rekap.data[rekap.labels.indexOf(bulan)] += 1;
            } else {
                rekap.labels.push(bulan);
                rekap.data.push(1);
            }

            // topview
        });
        setBlogViewChart(rekap);
    });

    chartRekap();
    fillRekap();
});