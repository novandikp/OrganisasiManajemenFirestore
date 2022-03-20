export default class UserRepository {
  constructor() {
    this.collection = collection(db, "users");
    this.id = "user_";
  }

  async isExistEmail(email) {
    const q = query(this.collection, where("email", "==", email), limit(1));
    const docSnap = await getDocs(q);
    if (docSnap.size > 0) {
      const doc = docSnap.docs[0];
      const user = await doc.data();
      user.id = doc.id;
      const jabatan = await getDoc(user.jabatan);
      user.jabatan = jabatan.id;
      return user;
    } else {
      return null;
    }
  }

  async login(user) {
    const data = await this.isExistEmail(user.email);
    if (data) {
      if (data.password == user.password) {
        localStorage.setItem("user_info", JSON.stringify(data));
        return responseResult(true, data, "Berhasil login");
      } else {
        return responseResult(false, null, "Password salah");
      }
    } else {
      return responseResult(false, null, "Email tidak terdaftar");
    }
  }

  async register(user) {
    const check = await this.isExistEmail(user.email);
    if (check) {
      return responseResult(false, null, "Email sudah terdaftar");
    } else {
      user.jabatan = doc(db, "jabatan", "anggota");
      const id = uuid(this.id);
      const docUser = doc(db, "users", id);
      const docSnap = await setDoc(docUser, user);
      return responseResult(true, docSnap, "Berhasil mendaftar");
    }
  }
}
