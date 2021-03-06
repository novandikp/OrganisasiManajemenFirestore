import UserRepository from "../repository/userRepository.js?v=1.3";
$(document).ready(function() {
    const userRepo = new UserRepository();

    $("#login-form").on("submit", function(e) {
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
        const user = {
            email: values.email,
            password: values.password,
        };
        userRepo.login(user).then(function(result) {
            button.prop("disabled", false);
            button.text("Sign in");
            if (result.status) {
                redirect_to("pages/dashboard");
            } else {
                $.alert({
                    title: "Error",
                    content: result.message,
                });
            }
        });
    });
});