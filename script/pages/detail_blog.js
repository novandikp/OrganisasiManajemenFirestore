$(document).ready(function () {
  const id = findGetParameter("id");
  if (!id) {
    redirect_to("index");
  }
  const itemLoad = () => {
    $(".list-data").empty();
    for (let i = 0; i < 4; i++) {
      const item = `<div class="col-md-6"><div class="d-md-flex align-items-center">
          <div class="col-md-12">
              <div class="card  flex-md-row mb-4 shadow-sm h-md-250 skeleton">
                  <div class="card-body d-flex flex-column align-items-start">
                      <strong class="d-inline-block mb-2 text-primary  skeleton">BLOG</strong>
                      <h3 class="mb-0">
                          <a class="text-dark  skeleton" href="blog.html">Judul Blog</a>
                      </h3>
                      <div class="mb-1 text-muted  skeleton">23 Maret 2022</div>
                      <p class="card-text mb-auto  skeleton">Deskripsi materi blog singkat.</p>
                      <a class="skeleton" href="blog.html">Continue reading</a>
                    
                  </div>
                  <img class="card-img-right flex-auto d-none d-lg-block img-thumb-blog" src="https://dummyimage.com/900x400/ced4da/6c757d.jpg" alt="Card image cap">
              </div>
          </div>
      </div></div>`;

      $(".list-data").append(item);
    }
  };
  const getBlogs = async () => {
    const dokumen = doc(db, "blogs", id);
    const data = await getDoc(dokumen);
    const element = data.data();
    const user = await getDoc(element.author);
    const label = await getDoc(element.category);
    element.user = await user.data();
    element.label = await label.id;
    $(".blog-post-title").text(element.title);

    $("#tanggalDibuat").text(format_date(element.created_at));
    $("#penulis").text(element.user.name);
    $(".image-blog").attr("src", element.image);
    $(".blog-content").html(element.description);
    $(".skeleton").removeClass("skeleton");
  };
  getBlogs();
});
