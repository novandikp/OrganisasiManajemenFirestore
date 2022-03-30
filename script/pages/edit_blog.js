$(document).ready(function() {
    const id = findGetParameter("id");
    if (!id) {
        redirect_to("index");
    }
    $("input").prop("disabled", "true");

    let fileImage = undefined;
    //Text area editor
    const editor = SUNEDITOR.create(
        document.getElementById("inputDescription") || "inputDescription", {
            buttonList: [
                ["undo", "redo"],
                ["font", "fontSize", "formatBlock"],
                ["paragraphStyle", "blockquote"],
                ["bold", "underline", "italic", "strike", "subscript", "superscript"],
                ["fontColor", "hiliteColor", "textStyle"],
                ["removeFormat"],
                ["outdent", "indent"],
                ["align", "horizontalRule", "list", "lineHeight"],
                ["table", "link"],
                ["fullScreen", "showBlocks"],
                ["preview", "print"],
                [],
                /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
            ],
        }
    );
    $("textarea").prop("disabled", "true");
    const getBlogs = async() => {
        const dokumen = doc(db, "blogs", id);
        getDoc(dokumen).then(async(data) => {
            const element = data.data();
            const label = await getDoc(element.category);
            element.label = await label.id;
            $("#title").val(element.title);

            editor.setContents(element.description);
            $("#preview-image").attr("src", element.image);
            $(`#labelBlog option[value='${element.label}']`).prop("selected", true);
            $("#preview-image").removeClass("d-none");
            $("input").removeAttr("disabled");
        });

        // editor.setContent(element.description);
        // $(".skeleton").removeClass("skeleton");
    };

    //Event Ketika gambar berubah
    $("#imageBlog").on("change", function(e) {
        fileImage = e.target.files[0];
        thumbnailFile(this, $("#preview-image"));
        $("#preview-image").removeClass("d-none");
    });

    // Ubah label
    const fetchLabels = () => {
        $("#labelBlog").empty();
        getDocs(collection(db, "labels")).then((snap) => {
            snap.forEach((element) => {
                $("#labelBlog").append(
                    `<option value="${element.id}">${element.id}</option>`
                );
            });
            getBlogs();
        });
    };

    fetchLabels();

    // Tambah label
    $("#formLabel").on("submit", function(e) {
        e.preventDefault();
        const label = $("#inputLabel").val();
        const labels = doc(db, "labels", label);
        setDoc(labels, { label: label }).then((doc) => {
            $("#inputLabel").val("");
            $("#labelBlog").append(`<option value="${label}">${label}</option>`);
            $("#formLabelModal").modal("hide");
        });
    });

    //Simpan Blog
    $("#btn-upload").on("click", function(e) {
        e.preventDefault();
        const blog = {};
        blog.title = $("#title").val();
        blog.description = editor.getContents();
        blog.category = doc(db, "labels", $("#labelBlog").val());
        blog.updated_at = new Date().toISOString();

        if (fileImage) {
            uploadFile(fileImage, id).then((url) => {
                blog.image = url;
                const blogs = doc(db, "blogs", id);
                updateDoc(blogs, blog).then((doc) => {
                    redirect_to("pages/blog");
                });
            });
        } else {
            const blogs = doc(db, "blogs", id);
            updateDoc(blogs, blog).then((doc) => {
                redirect_to("pages/blog");
            });
        }
    });
});