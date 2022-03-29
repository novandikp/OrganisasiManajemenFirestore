export default class BlogRepository {
    constructor() {
        this.rekap = doc(db, "rekap", "blog");
    }

    getRekap() {
        return getDoc(this.rekap).then((doc) => {
            return doc.data().value;
        });
    }

    async tambahBlog() {
        return this.getRekap().then((saldo) => {
            return updateDoc(this.rekap, { value: saldo + 1 });
        });
    }

    kurangBlog() {
        this.getRekap().then((saldo) => {
            updateDoc(this.rekap, { value: saldo - 1 });
        });
    }
}