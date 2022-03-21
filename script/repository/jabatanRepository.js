export default class JabatanRepository {
  constructor() {
    this.collection = collection(db, "jabatan");
    this.id = "jabatan_";
  }

  async fetchJabatan(search = "") {
    const q = query(this.collection, where("jabatan", ">=", search));
    const docSnap = await getDocs(q);
    const data = [];
    await docSnap.forEach(async (element) => {
      data.push(temp);
    });

    return responseResult(true, data, "Berhasil mengambil data");
  }

  async updateJabatan(jabatan) {
    const docJabatan = doc(db, "jabatan", jabatan.id);
    delete jabatan.id;
    const docSnap = await setDoc(docJabatan, jabatan);
    return responseResult(true, docSnap, "Berhasil mengubah jabatan");
  }

  async deleteJabatan(jabatan) {
    const docJabatan = doc(db, "jabatan", jabatan.id);
    const docSnap = await deleteDoc(docJabatan);
    return responseResult(true, docSnap, "Berhasil menghapus jabatan");
  }

  async addJabatan(jabatan) {
    const id = uuid(this.id);
    const docJabatan = doc(db, "jabatan", id);
    const docSnap = await setDoc(docJabatan, jabatan);
    return responseResult(true, docSnap, "Berhasil menambahkan jabatan");
  }
}
