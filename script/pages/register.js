import UserRepository from "../repository/userRepository.js?v=1.3";
$(document).ready(function() {
    const userRepo = new UserRepository();

    $("#tglLahir").val(new Date().toDateInputValue());
    $("#register-form").submit(function(e) {
        e.preventDefault();

        const button = $(this).find("button");
        button.prop("disabled", true);
        button.text("Loading...");
        let values = {};
        $(this)
            .serializeArray()
            .forEach((element) => {
                values[element.name] = element.value;
            });

        values.tglLahir = new Date(values.tglLahir).toISOString().slice(0, 10);

        userRepo.register(values).then(function(result) {
            button.prop("disabled", false);
            button.text("Daftar");
            if (result.status) {
                redirect_to("info");
            } else {
                $.alert({
                    title: "Error",
                    content: result.message,
                });
            }
        });
    });
});