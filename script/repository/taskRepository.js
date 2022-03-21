export default class taskRepository {
  constructor() {
    this.collection = collection(db, "task");
    this.id = "task_";
  }

  async fetchTask(search = "") {
    const q = query(this.collection, where("task", ">=", search));
    const docSnap = await getDocs(q);
    const data = [];
    await docSnap.forEach(async (element) => {
      data.push(temp);
    });

    return responseResult(true, data, "Berhasil mengambil data");
  }

  async updateTask(task) {
    const docTask = doc(db, "task", task.id);
    delete task.id;
    const docSnap = await setDoc(docTask, task);
    return responseResult(true, docSnap, "Berhasil mengubah task");
  }

  async deleteTask(task) {
    const docTask = doc(db, "task", task.id);
    const docSnap = await deleteDoc(docTask);
    return responseResult(true, docSnap, "Berhasil menghapus task");
  }

  async addTask(task) {
    const id = uuid(this.id);
    const docTask = doc(db, "task", id);
    docTask.created_by = doc(db, "users", getUserInfo().id);
    docTask.for = doc(db, "users", task.for);
    const docSnap = await setDoc(docTask, task);
    return responseResult(true, docSnap, "Berhasil menambahkan task");
  }
}
