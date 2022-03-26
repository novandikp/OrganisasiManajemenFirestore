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
        $(".blog-post-title").text(element.title);
        $("#tanggalDibuat").text(format_date(element.created_at));
        $("#penulis").text(element.user.name);
        $(".image-blog").attr("src", element.image);
        $(".blog-content").html(element.description);
        $(".skeleton").removeClass("skeleton");
    };

    getBlogs();
});