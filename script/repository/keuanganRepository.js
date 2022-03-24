export default class KeuanganRepository {
  constructor() {
    this.rekap = doc(db, "rekap", "keuangan");
  }

  getSaldo() {
    return getDoc(this.rekap).then((doc) => {
      return doc.data().value;
    });
  }

  addPemasukan(amount) {
    this.getSaldo().then((saldo) => {
      updateDoc(this.rekap, { value: saldo + amount });
    });
  }

  addPengeluaran(amount) {
    this.getSaldo().then((saldo) => {
      updateDoc(this.rekap, { value: saldo - amount });
    });
  }
}
