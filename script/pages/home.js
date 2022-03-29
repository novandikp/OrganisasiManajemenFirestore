$(document).ready(function() {
    const itemLoad = () => {
        $(".list-data").empty();
        for (let i = 0; i < 4; i++) {
            const item = `<div class="row my-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="row">
                        <div class="col-md-4">
                            <div  class="img-blog skeleton"></div>
                        </div>
                        <div class="col-md-8">
                            <div class="py-3 content-blog">
                                <h4 class="mb-0">
                                    <a href="#" class="fw-bold text-dark skeleton">
                                       Judul Ini Adalah
                                    </a>
                                </h4>
                                <small class="text-muted skeleton">Kamis, 27 Agustus 2022</small>
                                <div class="content-blog-card skeleton  mt-3 text-secondary">
                                 
                                </div>
                                <p>
                                    <a href="#" class="btn btn-primary skeleton">Read More</a>
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>`;

            $("#list-blog").append(item);
        }
    };

    const getBlogs = (search = "") => {
        itemLoad();
        const q = query(
            collection(db, "blogs"),
            where("title", ">=", search),
            where("title", "<=", search + "~")
        );

        getDocs(q).then(async(querySnapshot) => {
            $("#list-blog").empty();
            querySnapshot.forEach(async(doc) => {
                const element = doc.data();
                const user = await getDoc(element.author);
                const label = await getDoc(element.category);
                element.user = await user.data();
                element.label = await label.id;
                element.id = doc.id;
                console.log(element);
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
                                    <small class="text-muted">Kamis, 27 Agustus 2022</small>
                                    <div class="content-blog-card  mt-3 text-secondary">
                                       ${element.description} 
                                    </div>
                                    <p>
                                        <a href="${base_url(
                                          "blog",
                                          "?id=" + element.id
                                        )}" class="btn btn-primary">Read More</a>
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
                $("#list-blog").append(item);
            });
        });
    };

    const loadConfig = () => {
        getDocs(collection(db, "pengaturan")).then((doc) => {
            const config = {};
            doc.forEach((snap) => {
                config[snap.id] = snap.data().value;
            });
            $(".skeleton").removeClass("skeleton");
            $("#judul_cover").text(config.judul_cover);
            console.log(config);
            $("#dekripsi_cover").text(config.dekripsi_cover);
        });
    };

    const loadLabel = () => {
        getDocs(collection(db, "labels")).then((doc) => {
            $(".list-label").empty();
            doc.forEach((snap) => {
                const element = snap.data();
                element.id = snap.id;
                const item = `<a href="#" class="list-group-item list-group-item-action">${element.label}</a>`;
                $(".list-label").append(item);
            });
        });
    };

    loadLabel();
    loadConfig();
    getBlogs();

    window.onscroll = function() {
        scrollFunction();
    };
    $("#tahun").text(new Date().getFullYear());
    $(".navbar-toggler").click(function() {
        $("#navbar").toggleClass("bg-sm-primary");
    });

    if (isLogin()) {
        $(".btn-sign-in").html(`<i class = "fa fa-user me-2"> </i>Anggota`);
        $(".btn-sign-in").attr("href", base_url("pages/dashboard"));
    } else {
        $(".btn-sign-in").html(`<i class = "fa fa-sign-in me-2"> </i>Login`);
        $(".btn-sign-in").attr("href", base_url("masuk"));
    }

    function scrollFunction() {
        if (
            document.body.scrollTop > 150 ||
            document.documentElement.scrollTop > 150
        ) {
            document.getElementById("navbar").classList.add("bg-primary");
            document.querySelector(".text-cover").classList.add("d-none");
            // document.getElementById("logo").style.fontSize = "25px";
        } else {
            document.getElementById("navbar").classList.remove("bg-primary");

            document.querySelector(".text-cover").classList.remove("d-none");
            // document.getElementById("logo").style.fontSize = "35px";
        }
    }
});