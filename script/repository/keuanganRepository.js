export default class KeuanganRepository {
  constructor() {
    this.collection = collection(db, "keuangan");
    this.id = "keuangan_";
  }

  async fetchKeuangan(search = "") {
    const q = query(this.collection, where("keuangan", ">=", search));
    const docSnap = await getDocs(q);
    const data = [];
    await docSnap.forEach(async (element) => {
      data.push(temp);
    });

    return responseResult(true, data, "Berhasil mengambil data");
  }

  async tambahPengeluaran(jumlah_uang) {
    const id = uuid(this.id);
    const docKeuangan = doc(db, "keuangan", id);
    docKeuangan.debit = 0;
    docKeuangan.credit = jumlah_uang;
    docKeuangan.created_at = Timestamp.now();
    docKeuangan.user = doc(db, "users", getUserInfo().id);
    const docSnap = await setDoc(docKeuangan, data);
    return responseResult(true, docSnap, "Berhasil menambahkan data");
  }

  async tambahPemasukan(jumlah_uang) {
    const id = uuid(this.id);
    const docKeuangan = doc(db, "keuangan", id);
    docKeuangan.debit = jumlah_uang;
    docKeuangan.credit = 0;
    docKeuangan.created_at = Timestamp.now();
    docKeuangan.user = doc(db, "users", getUserInfo().id);
    const docSnap = await setDoc(docKeuangan, data);
    return responseResult(true, docSnap, "Berhasil menambahkan data");
  }
}
