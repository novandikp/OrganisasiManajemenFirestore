import KeuanganRepository from "./keuanganRepository.js?v=1.3";
export default class BulananRepository {
    constructor(date) {
        this.date = new Date(date);
        this.month = this.date.getMonth() + 1;
        this.year = this.date.getFullYear();
        this.rekap = doc(db, "rekap_bulanan", this.year + "_" + this.month);
        const namaBulan = [
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
        this.data = {
            nama_bulan: namaBulan[this.month - 1],
            tahun: this.year,
            bulan: this.month,
            saldo: 0,
        };
        this.keuanganRepo = new KeuanganRepository();
    }

    getSaldo() {
        return getDoc(this.rekap)
            .then((doc) => {
                if (doc.exists) {
                    return doc.data().saldo;
                } else {
                    return 0;
                }
            })
            .catch(() => {
                return 0;
            });
    }

    addPemasukan(amount) {
        this.getSaldo().then((saldo) => {
            this.data.saldo = saldo + amount;
            console.log(this.data);
            setDoc(this.rekap, this.data);
            this.keuanganRepo.addPemasukan(amount);
        });
    }

    addPengeluaran(amount) {
        this.getSaldo().then((saldo) => {
            this.data.saldo = saldo + amount;
            setDoc(this.rekap, this.data);
            this.keuanganRepo.addPengeluaran(amount);
        });
    }
}