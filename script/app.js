// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.9/firebase-app.js";
import Chipper from "./library/Chipper.js";
import * as firebasedatabase from "https://www.gstatic.com/firebasejs/9.6.9/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.9/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBrH3jBiL0UawmG7nVs_BXG9U4NnQ8XBa4",
    authDomain: "organisasimanajemen-6aad0.firebaseapp.com",
    databaseURL: "https://organisasimanajemen-6aad0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "organisasimanajemen-6aad0",
    storageBucket: "organisasimanajemen-6aad0.appspot.com",
    messagingSenderId: "922142036836",
    appId: "1:922142036836:web:ac1d46a4e72ce98295e071",
    measurementId: "G-DVH23QVKV0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = firebasedatabase.getFirestore();

// readIssues();

const defFunc = () => {};
const errFunc = (error) => {
    console.error(error);
};

function uuid(prefix = "") {
    return (
        prefix +
        ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16)
        )
    );
}

function responseResult(status, data, message = "") {
    return {
        status,
        data,
        message,
    };
}

function isLogin() {
    if (localStorage.getItem("user_info")) {
        return true;
    } else {
        return false;
    }
}

function getUserInfo() {
    if (isLogin) {
        return JSON.parse(localStorage.getItem("user_info"));
    } else {
        return null;
    }
}

function signOut() {
    localStorage.removeItem("user_info");
    redirect_to("masuk");
}

$("#sign-out").click(function() {
    signOut();
});

async function upload(file, name) {
    const storage = getStorage();
    const filename = getFileName(file, name);
    const storageRef = ref(storage, filename);
    return uploadBytes(storageRef, file).then((snapshot) => {
        return getDownloadURL(storageRef).then((url) => {
            return Promise.resolve(url);
        });
    });
}

function getFileName(file, name) {
    const extension = file.name.substring(file.name.lastIndexOf(".") + 1);
    return name + "." + extension;
}

function formatRupiah(angka) {
    let separator = ".";
    var number_string = angka.replace(/[^,\d]/g, "").toString(),
        split = number_string.split(","),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }

    rupiah = split[1] != undefined ? rupiah + "," + split[1] : rupiah;
    return rupiah;
}

function thumbnailFile(input, image) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $(image).attr("src", e.target.result);
            image.attr("src", e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function base_url(param = "/", params = "") {
    if (param[0] != "/") {
        param = "/" + param;
    }
    if (!param.includes(".html")) {
        param = param + ".html";
    }
    return window.location.origin + param + params;
}

function assets(param = "/") {
    if (param[0] != "/") {
        param = "/" + param;
    }

    return window.location.origin + param;
}

function redirect_to(url) {
    window.location.href = base_url(url);
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function(item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

//Format Tanggal untuk default input
Date.prototype.toDateInputValue = function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
};

const chipper = new Chipper("OKE123");

function format_date(date) {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const dateTemp = new Date(date);
    return dateTemp.toLocaleDateString("id-ID", options);
}

// Middleware
if (document.URL.includes("/pages")) {
    if (!isLogin()) {
        redirect_to("masuk");
    }
} else if (
    document.URL.includes("/masuk.html") ||
    document.URL.includes("/register.html") ||
    document.URL.includes("/info.html")
) {
    if (isLogin()) {
        redirect_to("pages/dashboard");
    }
}
//

// Update Login Info
function updateLoginInfo() {
    if (isLogin()) {
        const date = new Date(localStorage.getItem("recent_update_info"));
        const now = new Date();
        if (
            date - now >= 600000 ||
            localStorage.getItem("recent_update_info") == undefined
        ) {
            const user = getUserInfo();
            localStorage.setItem("recent_update_info", new Date().toISOString());
            firebasedatabase
                .getDoc(firebasedatabase.doc(db, "users", user.id))
                .then(async(snap) => {
                    const recentData = snap.data();
                    recentData.id = snap.id;
                    const jabatan = await firebasedatabase.getDoc(recentData.jabatan);
                    recentData.jabatan = jabatan.id;
                    recentData.detailJabatan = jabatan.data();
                    localStorage.setItem("user_info", JSON.stringify(recentData));
                })
                .catch(() => {
                    signOut();
                });
        }
    }
}
$(".modal").on("hidden.bs.modal", function() {
    $(this).find("form").trigger("reset");
});

function restrictedAccess() {
    if (isLogin()) {
        updateLoginInfo();
        const aksesArray = [];
        $.each(getUserInfo().detailJabatan, function(index, value) {
            if (value == true) {
                aksesArray.push(index);
            } else if (value == false) {
                $("#" + index).hide();
            }
        });
        // Cek
        if (!aksesArray.includes("akses_kas") &&
            !aksesArray.includes("akses_keuangan")
        ) {
            $("[data-bs-target='#finance']").hide();
        }
        const content = $("body").data("content");
        if (content) {
            if (!aksesArray.includes(content)) {
                redirect_to("pages/dashboard");
            }
        }
    }
}

function isPhoneNumber(evt) {
    evt = evt ? evt : window.event;
    var charCode = evt.which ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 43) {
        return false;
    }
    return true;
}

const elementNotFound = `<div class="my-5 d-flex justify-content-center align-items-center">
<img src="${assets("image/404.png")}" width="400" alt="" class="img-fluid" />
</div>`;

restrictedAccess();
window.updateLoginInfo = updateLoginInfo;
window.db = db;
window.fb = firebasedatabase;
window.getDocs = firebasedatabase.getDocs;
window.getDoc = firebasedatabase.getDoc;
window.collection = firebasedatabase.collection;
window.doc = firebasedatabase.doc;
window.setDoc = firebasedatabase.setDoc;
window.updateDoc = firebasedatabase.updateDoc;
window.deleteDoc = firebasedatabase.deleteDoc;
window.collectionGroup = firebasedatabase.collectionGroup;
window.responseResult = responseResult;
window.uuid = uuid;
window.where = firebasedatabase.where;
window.query = firebasedatabase.query;
window.limit = firebasedatabase.limit;
window.startAt = firebasedatabase.startAt;
window.startAfter = firebasedatabase.startAfter;
window.endAt = firebasedatabase.endAt;
window.documentId = firebasedatabase.documentId;
window.getUserInfo = getUserInfo;
window.isLogin = isLogin;
window.Timestamp = firebasedatabase.Timestamp;
window.uploadFile = upload;
window.getFileName = getFileName;
window.thumbnailFile = thumbnailFile;
window.Chipper = chipper;
window.findGetParameter = findGetParameter;
window.base_url = base_url;
window.redirect_to = redirect_to;
window.format_date = format_date;
window.formatRupiah = formatRupiah;
window.orderBy = firebasedatabase.orderBy;
window.isPhoneNumber = isPhoneNumber;
window.elementNotFound = elementNotFound;