export default class UserRepository {
  constructor() {
    this.collection = collection(db, "users");
    this.id = "user_";
  }

  async isExistEmail(email, id = null) {
    let q;
    if (id) {
      q = query(
        this.collection,
        where("email", "==", email),
        where("id", "!=", id),
        limit(1)
      );
    } else {
      q = query(this.collection, where("email", "==", email), limit(1));
    }
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
      user.password = Chipper.encrypt(user.password);
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
    } else if (user.password.length < 6) {
      return responseResult(false, null, "Password minimal 6 karakter");
    } else if (user.password != user.password2) {
      return responseResult(false, null, "Password tidak sama");
    } else {
      user.password = Chipper.encrypt(user.password);
      user.jabatan = doc(db, "jabatan", "anggota");
      const id = uuid(this.id);
      const docUser = doc(db, "users", id);
      user.status = false;
      const docSnap = await setDoc(docUser, user);
      return responseResult(true, docSnap, "Berhasil mendaftar");
    }
  }

  async update(user) {
    const check = await this.isExistEmail(user.email);
    if (check) {
      return responseResult(false, null, "Email sudah terdaftar");
    } else {
      const docUser = doc(db, "users", user.id);
      delete user.id;
      const docSnap = await setDoc(docUser, user);
      return responseResult(true, docSnap, "Berhasil mengubah data");
    }
  }
}
