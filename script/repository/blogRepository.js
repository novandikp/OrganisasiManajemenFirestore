export default class BlogRepository {
  constructor() {
    this.collection = collection(db, "blogs");
    this.id = "blog_";
  }

  async fetchBlogs(search = "") {
    const q = query(this.collection, where("title", ">=", search));
    const docSnap = await getDocs(q);
    const data = [];
    await docSnap.forEach(async (element) => {
      const temp = element.data();
      temp.jabatan = await getDoc(element.ref());
      data.push(temp);
    });

    return data;
  }

  async addBlog(blog) {
    const id = uuid(this.id);
    blog.user = doc(db, "users", getUserInfo().id);
    const docBlog = doc(db, "blogs", id);
    const docSnap = await setDoc(docBlog, blog);
    return responseResult(true, docSnap, "Berhasil menambahkan blog");
  }
}
