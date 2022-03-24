export default class KasRepository {
  constructor() {
    this.rekap = doc(db, "rekap", "kas");
  }

  getSaldo() {
    return getDoc(this.rekap).then((doc) => {
      return doc.data().value;
    });
  }

  tambahKas(amount) {
    this.getSaldo().then((saldo) => {
      updateDoc(this.rekap, { value: saldo + amount });
    });
  }

  kurangKas(amount) {
    this.getSaldo().then((saldo) => {
      updateDoc(this.rekap, { value: saldo - amount });
    });
  }
}
