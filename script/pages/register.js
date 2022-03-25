import UserRepository from "../repository/userRepository.js";
$(document).ready(function() {
    const userRepo = new UserRepository();

    $("#register-form").submit(function(e) {
        const button = $(this).find("button");
        button.prop("disabled", true);
        button.text("Loading...");
        e.preventDefault();
        let values = {};
        $(this)
            .serializeArray()
            .forEach((element) => {
                values[element.name] = element.value;
            });
        if (values.password2) {
            delete values.password2;
        }
        userRepo.register(values).then(function(result) {
            button.prop("disabled", false);
            button.text("Sign in");
            if (result.status) {
                redirect_to("pages/user");
            } else {
                alert(result.message);
            }
        });
    });
});