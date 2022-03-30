$(document).ready(function() {
    let chartBar, chartPie;
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

    chartRekap();
    fillRekap();
});