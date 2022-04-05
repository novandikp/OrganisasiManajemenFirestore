import BlogRepository from "../repository/blogRepository.js?v=1.3";
$(document).ready(function() {
    const blogRepo = new BlogRepository();
    const showItem = 5;
    let lastItem;

    // Hapus Blog
    const deleteBlog = function(id) {
        const docBlog = doc(db, "blogs", id);
        return deleteDoc(docBlog).then((docsnap) => {
            blogRepo.kurangBlog();
            return responseResult(true, [], "Berhasil Menghapus Blog");
        });
    };

    // Skeleton Item
    const itemLoad = () => {
        if (!lastItem) {
            $(".list-data").empty();
        }
        for (let i = 0; i < showItem; i++) {
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

    // Event Item
    const itemEvent = () => {
        $(".list-data").on("click", ".item-hapus", async function() {
            const id = $(this).data("id");
            const element = $(this);
            $.confirm({
                title: "Konfirmasi",
                content: "Apakah anda yakin untuk menghapus data ini?",
                buttons: {
                    confirm: function() {
                        element.attr("disabled", true);
                        deleteBlog(id).then(() => {
                            lastItem = null;
                            getBlogs();
                        });
                    },
                    cancel: function() {},
                },
            });
        });
        $(".list-data").on("click", ".btn-load-more", async function() {
            getBlogs($("#search").val());
        });
    };

    //Fetch Data
    const getBlogs = (search = "") => {
        fetchDataBlog(search).then(async(querySnapshot) => {
            $(".btn-load-more").remove();
            // Hapus skeleton
            $(".card.flex-md-row.mb-4.shadow-sm.h-md-250.skeleton")
                .parent()
                .parent()
                .remove();

            if (querySnapshot.length == 0) {
                $(".list-data").html(elementNotFound);
            } else {
                let index = showItem + 1;
                querySnapshot.forEach(async(element) => {
                    index--;
                    if (index > 0) {
                        let item = $(
                            $.parseHTML(`<div class="row my-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="row">
                            <div class="col-md-4">
                                <img src="${
                                  element.image
                                }" alt="" class="img-blog">
                            </div>
                            <div class="col-md-8">
                                <div class="py-3 content-blog">
                                    <h4 class="mb-0">
                                        <a href="#" class="fw-bold text-dark">
                                            ${element.title}
                                        </a>
                                    </h4>
                                    <small class="text-muted">${format_date(
                                      element.created_at
                                    )}</small>
                                    <div class="content-blog-card  mt-3 text-secondary">
                                       ${element.description} 
                                    </div>
                                    <p>
                                    <a href="${base_url(
                                      "blog",
                                      "?id=" + element.id
                                    )}" class="btn btn-secondary btn-block btn-sm ">Lihat Preview</a>
                                      <a  href="${base_url(
                                        "pages/edit_blog",
                                        "?id=" + element.id
                                      )}" class="btn btn-primary btn-block btn-sm ">Edit</a>
                                      <button  data-id="${
                                        element.id
                                      }" class="btn btn-danger btn-block btn-sm item-hapus">Hapus</button>
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>`)
                        );
                        item.find(".content-blog-card *").removeAttr("style");
                        item.find(".content-blog-card *").css("font-size", "12pt");
                        item.find(".content-blog-card *").addClass("fw-light");
                        $(".list-data").append(item);
                    } else {
                        let loadMore = `<button class="btn btn-load-more">Tampilkan Lebih banyak</button>`;
                        $(".list-data").append(loadMore);
                    }
                });
            }
        });
    };

    const fetchDataBlog = async(search = $("#search").val()) => {
        let q;
        const promise = [];
        console.log(lastItem);
        if (lastItem) {
            q = query(
                collection(db, "blogs"),
                orderBy("title"),
                startAt(lastItem),
                where("title", ">=", search),
                where("title", "<=", search + "~"),
                limit(showItem + 1)
            );
        } else {
            $(".list-data").empty();
            q = query(
                collection(db, "blogs"),
                orderBy("title"),
                where("title", ">=", search),
                where("title", "<=", search + "~"),
                limit(showItem + 1)
            );
            itemLoad();
        }

        await getDocs(q).then((querySnapshot) => {
            lastItem = querySnapshot.docs[querySnapshot.docs.length - 1];
            querySnapshot.forEach((doc) => {
                const element = doc.data();
                element.id = doc.id;
                const data = getDoc(element.category).then((label) => {
                    element.label = label.id;
                    return element;
                });

                promise.push(data);
            });
        });

        return Promise.all(promise);
    };

    $("#formSearch").on("submit", (e) => {
        e.preventDefault();
        if ($("#search").val() != "") {
            lastItem = undefined;
            getBlogs($("#search").val());
        }
    });

    $("#search").on("search", function(evt) {
        if ($(this).val().length == 0) {
            lastItem = undefined;
            getBlogs();
        }
    });

    itemEvent();
    getBlogs();
});