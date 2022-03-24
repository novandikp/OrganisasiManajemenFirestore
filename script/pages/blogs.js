$(document).ready(function () {
  const getBlog = async function (id) {
    const docBlog = doc(db, "blogs", id);
    const docSnap = await getDoc(docBlog);
    return docSnap;
  };
  const deleteBlog = async function (id) {
    const docBlog = doc(db, "blogs", id);
    const docSnap = await deleteDoc(docBlog);
    return docSnap;
  };

  const itemLoad = () => {
    $(".list-data").empty();
    for (let i = 0; i < 4; i++) {
      const item = `<div class="d-md-flex align-items-center">
      <div class="col-md-12">
          <div class="card  flex-md-row mb-4 shadow-sm h-md-250 skeleton">
              <div class="card-body d-flex flex-column align-items-start">
                  <strong class="d-inline-block mb-2 text-primary  skeleton">BLOG</strong>
                  <h3 class="mb-0">
                      <a class="text-dark  skeleton" href="blog.html">Judul Blog</a>
                  </h3>
                  <div class="mb-1 text-muted  skeleton">23 Maret 2022</div>
                  <p class="card-text mb-auto  skeleton">Deskripsi materi blog singkat.</p>
                  <div class="d-grid gap-2 d-xl-block mt-3 w-100">
                      <button class="btn btn-secondary btn-block btn-sm  skeleton">Lihat Preview</button>
                      <button class="btn btn-primary btn-block btn-sm  skeleton">Edit</button>
                      <button class="btn btn-danger btn-block btn-sm  skeleton">Hapus</button>
                  </div>
                
              </div>
              <img class="card-img-right flex-auto d-none d-lg-block img-thumb-blog" src="https://dummyimage.com/900x400/ced4da/6c757d.jpg" alt="Card image cap">
          </div>
      </div>
  </div>`;

      $(".list-data").append(item);
    }
  };

  const itemEvent = () => {
    $(".list-data").on("click", ".item-hapus", async function () {
      const id = $(this).data("id");
      const element = $(this);
      $.confirm({
        title: "Konfirmasi",
        content: "Apakah anda yakin untuk menghapus data ini?",
        buttons: {
          confirm: function () {
            element.attr("disabled", true);
            deleteBlog(id).then(() => {
              getBlogs();
            });
          },
          cancel: function () {},
        },
      });
    });
  };

  const getBlogs = (search = "") => {
    itemLoad();
    const q = query(
      collection(db, "blogs"),
      where("title", ">=", search),
      where("title", "<=", search + "~")
    );

    getDocs(q).then(async (querySnapshot) => {
      $(".list-data").empty();
      querySnapshot.forEach(async (doc) => {
        const element = doc.data();
        const user = await getDoc(element.author);
        const label = await getDoc(element.category);
        element.user = await user.data();
        element.label = await label.id;
        element.id = doc.id;

        let item = `<div class="d-md-flex align-items-center">
        <div class="col-md-12">
            <div class="card  flex-md-row mb-4 shadow-sm h-md-250">
                <div class="card-body d-flex flex-column align-items-start">
                    <strong class="d-inline-block mb-2 text-primary ">${
                      element.label
                    }</strong>
                    <h3 class="mb-0">
                        <a class="text-dark " href="blog.html">${
                          element.title
                        }</a>
                    </h3>
                    <div class="mb-1 text-muted ">${format_date(
                      element.created_at
                    )}</div>
                    <div class="text-blog">${element.description}</div>
                    <div class="d-grid gap-2 d-xl-block mt-3 w-100">
                        <a href="#" class="btn btn-secondary btn-block btn-sm ">Lihat Preview</a>
                        <a  href="#" class="btn btn-primary btn-block btn-sm ">Edit</a>
                        <button  data-id="${
                          element.id
                        }" class="btn btn-danger btn-block btn-sm item-hapus">Hapus</button>
                    </div>
                  
                </div>
                <img class="card-img-right flex-auto d-none d-lg-block img-thumb-blog" src="${
                  element.image
                }" alt="Card image cap">
            </div>
        </div>
    </div>`;

        $(".list-data").append(item);
      });
    });
  };

  $("#formSearch").on("submit", (e) => {
    e.preventDefault();
    if ($("#search").val() != "") {
      getBlogs($("#search").val());
    }
  });

  $("#search").on("search", function (evt) {
    if ($(this).val().length == 0) {
      getBlogs();
    }
  });
  itemEvent();
  getBlogs();
});
