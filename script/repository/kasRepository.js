export default class KasRepository {
  constructor() {
    this.collection = collection(db, "kas");
    this.id = "kas_";
  }

  async fetchKas(search = "") {
    const q = query(this.collection, where("keterangan", ">=", search));
    const docSnap = await getDocs(q);
    const data = [];
    await docSnap.forEach(async (element) => {
      const temp = element.data();
      temp.user_id = await getDoc(element.ref());
      data.push(temp);
    });

    return responseResult(true, data, "Berhasil mengambil data");
  }

  async updateKas(kas) {
    const docKas = doc(db, "kas", kas.id);
    delete kas.id;
    kas.created_at = docKas.created_at;
    kas.updated_at = Timestamp.now();
    kas.user_id = docKas.user_id;
    kas.created_by = docKas.created_by;
    const docSnap = await setDoc(docKas, kas);
    return responseResult(true, docSnap, "Berhasil mengubah kas");
  }

  async deleteKas(kas) {
    const docKas = doc(db, "kas", kas.id);
    const docSnap = await deleteDoc(docKas);
    return responseResult(true, docSnap, "Berhasil menghapus kas");
  }

  async addKas(kas) {
    const id = uuid(this.id);
    kas.created_at = Timestamp.now();
    kas.updated_at = Timestamp.now();
    kas.user_id = doc(db, "users", kas.user_id);
    kas.created_by = doc(db, "users", getUserInfo().id);
    kas.status = false;
    const docKas = doc(db, "kas", id);
    const docSnap = await setDoc(docKas, kas);
    return responseResult(true, docSnap, "Berhasil menambahkan kas");
  }
}
