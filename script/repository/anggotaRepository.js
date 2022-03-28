export default class AnggotaRepository {
    constructor() {
        this.rekap = doc(db, "rekap", "anggota");
    }

    getRekap() {
        return getDoc(this.rekap).then((doc) => {
            return doc.data().value;
        });
    }

    tambahAnggota() {
        this.getRekap().then((saldo) => {
            updateDoc(this.rekap, { value: saldo + 1 });
        });
    }

    kurangAnggota() {
        this.getRekap().then((saldo) => {
            updateDoc(this.rekap, { value: saldo - 1 });
        });
    }
}