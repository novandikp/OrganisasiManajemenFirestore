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
      const temp = await element.data();
      temp.user_id = await getDoc(element.ref());
      data.push(temp);
    });

    return responseResult(true, data, "Berhasil mengambil data");
  }

  async updateBlog(blog) {
    const docBlog = doc(db, "blogs", blog.id);
    delete blog.id;
    blog.created_at = docBlog.created_at;
    blog.updated_at = Timestamp.now();
    const docSnap = await setDoc(docBlog, blog);
    return responseResult(true, docSnap, "Berhasil mengubah blog");
  }

  async deleteBlog(blog) {
    const docBlog = doc(db, "blogs", blog.id);
    const docSnap = await deleteDoc(docBlog);
    return responseResult(true, docSnap, "Berhasil menghapus blog");
  }

  async addBlog(blog) {
    const id = uuid(this.id);
    blog.created_at = Timestamp.now();
    blog.updated_at = Timestamp.now();
    blog.user = doc(db, "users", getUserInfo().id);
    const docBlog = doc(db, "blogs", id);
    const docSnap = await setDoc(docBlog, blog);
    return responseResult(true, docSnap, "Berhasil menambahkan blog");
  }
}
