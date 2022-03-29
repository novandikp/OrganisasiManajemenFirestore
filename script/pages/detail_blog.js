$(document).ready(function() {
    const id = findGetParameter("id");
    if (!id) {
        redirect_to("index");
    }

    const getBlogs = async() => {
        const dokumen = doc(db, "blogs", id);
        const data = await getDoc(dokumen);
        const element = data.data();
        const user = await getDoc(element.author);
        const label = await getDoc(element.category);
        element.user = await user.data();
        element.label = await label.id;
        console.log(element);
        $("#blog-post-title").text(element.title);
        $("#tanggalDibuat").text(format_date(element.created_at));
        $("#penulis").text(element.user.nama);
        $(".image-blog").attr("src", element.image);
        $(".blog-content").html(element.description);
        $(".skeleton").removeClass("skeleton");
    };

    const loadConfig = () => {
        getDocs(collection(db, "pengaturan")).then((doc) => {
            const config = {};
            doc.forEach((snap) => {
                config[snap.id] = snap.data().value;
            });
            $(".skeleton").removeClass("skeleton");
            $("#judul_cover").text(config.judul_cover);
            $("#judulFooter").text(config.judul_cover);
            $(".cover").css("background-image", `url(${config.cover})`);
            $("#dekripsi_cover").text(config.dekripsi_cover);
            console.log(config);
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

    $("#tahun").text(new Date().getFullYear());

    if (isLogin()) {
        $(".btn-sign-in").html(`<i class = "fa fa-user me-2"> </i>Anggota`);
        $(".btn-sign-in").attr("href", base_url("pages/dashboard"));
    } else {
        $(".btn-sign-in").html(`<i class = "fa fa-sign-in me-2"> </i>Login`);
        $(".btn-sign-in").attr("href", base_url("masuk"));
    }
});