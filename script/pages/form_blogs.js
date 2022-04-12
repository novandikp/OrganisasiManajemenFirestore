import BlogRepository from "../repository/blogRepository.js?v=1";
$(document).ready(function() {
    const blogRepo = new BlogRepository();
    let fileImage;
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

    //Event Ketika gambar berubah
    $("#imageBlog").on("change", function(e) {
        fileImage = e.target.files[0];
        $(this).removeClass("is-invalid");
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

    $("body").on("keyup", "input", function() {
        $(this).removeClass("is-invalid");
    });

    const validate = () => {
        let validation = true;
        if ($("#title").val().trim() == "") {
            $("#title").addClass("is-invalid");
            validation = false;
        }
        if (!fileImage) {
            $("#imageBlog").addClass("is-invalid");
            validation = false;
        }

        if ($($.parseHTML(editor.getContents())).text().trim() == "") {
            $("#suneditor_inputDescription").after(
                "<small class='text-danger'>Harap isi konten</small>"
            );
        }
        return validation;
    };

    //Simpan Blog
    $("#btn-upload").on("click", function(e) {
        e.preventDefault();
        if (validate()) {
            $("#btn-upload").text("Proses Publikasi...");
            $("#btn-upload").attr("disabled", true);
            const blog = {};
            blog.title = $("#title").val();
            blog.description = editor.getContents();
            blog.category = doc(db, "labels", $("#labelBlog").val());
            blog.created_at = new Date().toISOString();
            blog.updated_at = new Date().toISOString();
            blog.author = doc(db, "users", getUserInfo().id);
            blog.viewed = 0;
            const id = uuid("blogs_");
            uploadFile(fileImage, id).then((url) => {
                blog.image = url;
                const blogs = doc(db, "blogs", id);
                setDoc(blogs, blog).then((doc) => {
                    blogRepo.tambahBlog().then(() => {
                        redirect_to("pages/blog");
                    });
                });
            });
        }
    });
});