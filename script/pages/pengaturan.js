$(document).ready(function() {
    const saveValue = (key, value) => {
        const config = doc(db, "pengaturan", key);
        setDoc(config, { value: value });
    };

    const saveBlob = (key, value) => {
        uploadFile(value, key).then((url) => {
            const config = doc(db, "pengaturan", key);
            setDoc(config, { value: url });
        });
    };

    const profileContent = async() => {
        const content = $("#formPengaturan input , #formPengaturan textarea");
        return content.each(function(index, elemen) {
            if ($(this).attr("type") == "file") {
                if ($(this).prop("files").length > 0) {
                    saveBlob($(this).attr("name"), $(this).prop("files")[0]);
                }
            } else {
                saveValue($(this).attr("name"), $(this).val());
            }
        });
    };

    const getPengaturan = () => {
        const content = $("#formPengaturan input , #formPengaturan textarea");
        content.prop("disabled", true);
        const pengaturan = collection(db, "pengaturan");
        getDocs(pengaturan).then((snapshot) => {
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (
                    $("#formPengaturan [name='" + doc.id + "']").attr("type") != "file"
                ) {
                    $("#formPengaturan [name='" + doc.id + "']").val(data.value);
                } else {
                    $("#formPengaturan [data-for='" + doc.id + "']").attr(
                        "src",
                        data.value
                    );
                    $("#formPengaturan [data-for='" + doc.id + "']").removeClass(
                        "d-none"
                    );
                }

                $(
                    "#formPengaturan input[name='" +
                    doc.id +
                    "'] , #formPengaturan textarea[name='" +
                    doc.id +
                    "']"
                ).removeAttr("disabled");
            });
        });
    };

    $("#formPengaturan input[type='file']").on("change", function(e) {
        thumbnailFile(this, $("[data-for='" + $(this).attr("name") + "']"));
    });

    $("#formPengaturan").on("submit", function(e) {
        e.preventDefault();
        profileContent().then(() => {
            $.alert({
                title: "Berhasil",
                content: "Data berhasil disimpan",
            });
        });
    });

    getPengaturan();
});